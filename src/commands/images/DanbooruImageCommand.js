const { EmbedBuilder } = require("discord.js");
const { ignore } = require("@joshbrucker/discordjs-utils");

const danbooru = require(global.__basedir + "/external_services/danbooru");
const { generatePalette } = require(global.__basedir + "/utils/utils.js");
const { maybePluralize, prefixWithAnOrA } = require(global.__basedir + "/utils/string-utils.js");
const { IGNORE_ERRORS } = require(global.__basedir + "/constants/constants.js");

// is:sfw is technically free, but since users can input tag "nsfw", we need to count it here
const STARTING_DEFAULT_TAGS = [ "-comic", "is:sfw", "order:random", "-loli", "-shota" ];
const STARTING_FREE_TAGS = [ "-status:banned" ];
const MAX_TAG_COUNT = 12;

async function handleDanbooruCommand(interaction, name, commandDefaultTags, rawRequestedTags) {
  let channel = interaction.channel;

  let requestedTags = splitRawTags(rawRequestedTags);
  let maxTags = MAX_TAG_COUNT - STARTING_DEFAULT_TAGS.length - commandDefaultTags.length;
  let defaultTags = STARTING_DEFAULT_TAGS.concat(commandDefaultTags).concat(STARTING_FREE_TAGS);

  if (requestedTags.length > maxTags) {
    await interaction.reply(`You can only have up to ${maxTags} tags!`);
    return;
  }

  if (requestedTags.length > 0) {
    await interaction.reply(`Searching with tags: [ **${[ ...requestedTags ].join(", ")}** ]`);
  } else {
    await interaction.reply(`Searching for ${prefixWithAnOrA(name)}...`);
  }

  let { validTags, userTags, invalidTags, isNsfw } = await parseTags(defaultTags, requestedTags);

  if (invalidTags.length > 0) {
    await interaction.editReply(`:x: Oops, I can't find the following ${maybePluralize("tag", invalidTags.length)} [ **${invalidTags.join(", ")}** ]`)
        .catch(ignore(IGNORE_ERRORS.EDIT));
    return;
  }

  if (isNsfw && !channel.nsfw) {
    await interaction.editReply(":underage: I'm not allowed to post NSFW content in this channel")
        .catch(ignore(IGNORE_ERRORS.EDIT));
    return;
  }

  let posts = await danbooru.getImage(validTags, 1);

  if (posts[0]) {
    await interaction.editReply(await generateMessagePayload(posts[0]))
        .catch(ignore(IGNORE_ERRORS.EDIT));
  } else {
    await interaction.editReply(`:x: I couldn't find ${prefixWithAnOrA(name)} with those tags`)
        .catch(ignore(IGNORE_ERRORS.EDIT));
  }
}

function splitRawTags(rawRequestedTags) {
  let splitTags = [];
  if (rawRequestedTags) {
    splitTags = rawRequestedTags.toLowerCase().split(/[$,]/g);
  }
  splitTags = splitTags.map(t => t.trim());
  return splitTags.filter(t => t !== "");
}

async function parseTags(defaultTags, requestedTags) {
  let validTags = new Set(defaultTags);

  for (let i = 0; i < requestedTags.length; i++) {
    let current = requestedTags[i];

    if (current === "nsfw") {
      requestedTags[i] = "is:nsfw";
      validTags.delete("is:sfw");
    } else if (current.match(/rating:(explicit|questionable)/)) {
      validTags.delete("is:sfw");
    } else if (current === "explicit" || current === "questionable") {
      requestedTags[i] = "rating:" + current;
      validTags.delete("rating:safe");
    } else if (current === "comic") {
      validTags.delete("-comic");
    } else if (current.match(/([1-6]|(6\+))girl(s)?/)) {
      validTags.delete("*girl");
    } else if (current.match(/([1-6]|(6\+))boy(s)?/)) {
      validTags.delete("*boy");
    } else if (current === "gif") {
      requestedTags[i] = "animated_gif";
    } else if (current === "video") {
      requestedTags[i] = "animated";
    } else if (current === "sound" || current === "audio") {
      requestedTags[i] = "video_with_sound";
    } else {
      requestedTags[i] = danbooru.convertToValidTag(current);
    } 
  }

  let userTags = await Promise.all(requestedTags);

  let smallestTagCount = Number.MAX_SAFE_INTEGER;
  userTags.forEach(t => {
    if (t !== null && !(t instanceof danbooru.InvalidTag)) {
      if (t.post_count !== null && t.post_count < smallestTagCount) {
        smallestTagCount = t.post_count;
      }
      validTags.add(t.name || t);
    }
  });

  // if tag count will be over 20k, switch to faster (but potentially less effective) random tag
  if (validTags.has("order:random") && smallestTagCount >= 20000) {
    validTags.delete("order:random");
    validTags.add("random:1"); // will need to change if supporting more than 1 image at a time in the future...
  }

  validTags = [ ...validTags ]; // convert back to list from set
  let invalidTags = userTags.filter(t => t instanceof danbooru.InvalidTag).map(t => t.tag);
  let isNsfw = danbooru.hasNsfwTag(validTags);

  return {
    validTags: validTags,
    userTags: userTags.map(t => t.name || t),
    invalidTags: invalidTags,
    isNsfw: isNsfw
  };
}

async function generateMessagePayload(post) {
  if (post.file_ext === "png" || post.file_ext === "jpg" ||
      post.file_ext === "jpeg" || post.file_ext === "gif") {

    let url = post.preview_file_url || post.file_url || post.large_file_url;
    let palette;
    if (url) {
      palette = await generatePalette(url);
    }

    let embed = new EmbedBuilder()
        .setDescription(
          "Pictured: **" + danbooru.tagsToReadable(post.tag_string_character) + "**\n" +
          "From: **" + danbooru.tagsToReadable(post.tag_string_copyright) + "**\n" +
          "https://danbooru.donmai.us/posts/" + post.id
        )
        .setImage(post.large_file_url)
        .setColor(palette?.Vibrant.hex || 0xfc00ff);

    return {
      embeds: [ embed ],
      content: null
    };
  } else {
    return {
      content: "Pictured: **" + danbooru.tagsToReadable(post.tag_string_character) + "**\n" +
          "From: **" + danbooru.tagsToReadable(post.tag_string_copyright) + "**\n" +
          post.large_file_url
    };
  }
}

module.exports = {
  STARTING_DEFAULT_TAGS,
  MAX_TAG_COUNT,
  handleDanbooruCommand
};
