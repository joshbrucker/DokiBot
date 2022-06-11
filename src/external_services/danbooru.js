const Danbooru = require("danbooru");
const Vibrant = require("node-vibrant");
const { MessageEmbed, MessagePayload } = require("discord.js");

const auth = require(__basedir + "/auth.json");
const utils = require(__basedir + "/utils/utils.js");

const booru = new Danbooru(auth.danbooruLogin + ":" + auth.danbooruKey);

class InvalidTag {
  constructor(tag) {
    this.tag = tag;
  }
}

let hasNsfwTag = function(tags) {
  tags = new Set(tags);
  return tags.has("-rating:safe") || tags.has("rating:questionable") || tags.has("rating:explicit");
};

let convertToValidTag = async function(tag) {
  let tokenized = tag.split(/_| /);
  let matching = tag.replace(/_| /g, "*");
  let wildcarded = tag.replace(/_| /g, ".*");

  const [ basicSearch, tagAliases, tagAliases2, japaneseNameSearch, wildCardAttempt1, wildCardAttempt2, japaneseWildcarded ] = await Promise.all([
    booru.get("/tags", { "search[name]": tag, "search[order]": "count" }),
    booru.get("/tag_aliases", { "search[antecedent_name]": tag }),
    booru.get("/tag_aliases", { "search[name_matches]": matching + "*" }),
    (tokenized.length === 2) ? await booru.get("/tags", { "search[name_comma]": tokenized[1] + "_" + tokenized[0], "search[order]": "count"}) :  [],
    booru.get("/tags", { "search[name_regex]": wildcarded + ".*", "search[order]": "count" }),
    booru.get("/tags", { "search[name_regex]": ".*" + wildcarded + ".*", "search[order]": "count" }),
    booru.get("/tags", { "search[name_regex]": tokenized[1] + "_" + tokenized[0] + ".*", "search[order]": "count" })
  ]);

  if (basicSearch.length > 0 && basicSearch[0].post_count > 0) {
    return basicSearch[0].name;
  }
  else if (tagAliases.length > 0) {
    return tagAliases[0].consequent_name;
  }
  else if (japaneseNameSearch.length > 0 && japaneseNameSearch[0].post_count > 0) {
    return japaneseNameSearch[0].name;
  }
  else if (wildCardAttempt1.length > 0 && wildCardAttempt1[0].post_count > 0) {
    return wildCardAttempt1[0].name;
  }
  else if (wildCardAttempt2.length > 0 && wildCardAttempt2[0].post_count > 0) {
    return wildCardAttempt2[0].name;
  }
  else if (japaneseWildcarded.length > 0 && japaneseWildcarded[0].post_count > 0) {
    return japaneseWildcarded[0].name;
  }
  else if (tagAliases2.length > 0) {
    return tagAliases2[0].consequent_name;
  }

  return new InvalidTag(tag);
};

let generateTags = async function(defaultTags, requestedTags) {
  let finalTags = new Set([...defaultTags]);
  let customTags = [];

  requestedTags.forEach(t => {
    if (t === "nsfw") {
      finalTags.add("is:nsfw");
      finalTags.delete("is:sfw");
    } else if (t.match(/rating:(explicit|questionable)/)) {
      finalTags.add(t);
      finalTags.delete("is:sfw");
    } else if (t === "explicit" || t === "questionable") {
      finalTags.add("rating:" + t);
      finalTags.delete("rating:safe");
    } else if (t === "comic") {
      finalTags.add("comic");
      finalTags.delete("-comic");
    } else if (t.match(/([1-6]|(6\+))girl(s)?/)) {
      finalTags.add(t);
      finalTags.delete("*girl");
    } else if (t.match(/([1-6]|(6\+))boy(s)?/)) {
      finalTags.add(t);
      finalTags.delete("*boy");
    } else if (t === "gif" || t === "video") {
      finalTags.add("animated");
    } else if (t === "sound" || t === "audio") {
      finalTags.add("video_with_sound");
    } else {
      customTags.push(convertToValidTag(t));
    }
  });

  // gather all custom tags and add them to the final list
  (await Promise.all(customTags)).forEach(t => finalTags.add(t));

  return finalTags;
};

let tagsToReadable = function(title) {
  title = title.split(" ");
  title = title.map(t => t.replace(/_\([^)]*\)/g, "").replace(/_/g, " "));
  title = Array.from(new Set(title));

  if (title.length > 5) {
    title = title.slice(0, 5);
    title.push("...");
  }
  title = title.join(", ");

  // capitalize first letter of words
  return title.replace(
    /\w\S*\W*/g,
    function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    }
  );
};

let getImage = async function(tags, imageCount) {
  return await booru.posts({limit: imageCount, tags: Array.from(tags).join(" ")});
};

let generateMessagePayload = async function(post) {
  let payload;

  if (post.file_ext === "png" || post.file_ext === "jpg" ||
      post.file_ext === "jpeg" || post.file_ext === "gif") {
    let vibrant = new Vibrant(post.preview_file_url);
    let palette = await vibrant.getPalette();

    let embed = new MessageEmbed()
        .setDescription(
            "Pictured: **" + tagsToReadable(post.tag_string_character) + "**\n" +
            "From: **" + tagsToReadable(post.tag_string_copyright) + "**\n" +
            "https://danbooru.donmai.us/posts/" + post.id
        )
        .setImage(post.large_file_url)
        .setColor(palette.Vibrant.hex);

    payload = {
      embeds: [ embed ],
      content: null
    };
  } else {
    payload = {
      content: "Pictured: **" + tagsToReadable(post.tag_string_character) + "**\n" +
          "From: **" + tagsToReadable(post.tag_string_copyright) + "**\n" +
          post.large_file_url
    };
  }

  return payload;
};


module.exports = {
  InvalidTag,
  hasNsfwTag,
  generateTags,
  tagsToReadable,
  getImage,
  generateMessagePayload
};
