const { 
  Constants: { APIErrors: { UNKNOWN_MESSAGE }},
  MessageEmbed
} = require('discord.js');
const { ignore } = require("@joshbrucker/discordjs-utils");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Vibrant = require("node-vibrant");

const danbooru = require(__basedir + "/external_services/danbooru");
const { maybePluralize, prefixWithAnOrA } = require(__basedir + "/utils/string-utils.js");

class SearchType {
  constructor(name, tags) {
    this.name = name;
    this.tags = tags;
  }
}

const booruSearchTypes = {
  ANY: new SearchType("any", []),
  NEKO: new SearchType("neko", ["cat_ears"]),
  HUSBANDO: new SearchType("husbando", ["*boy"]),
  WAIFU: new SearchType("waifu", ["*girl"])
};

const DEFAULT_TAGS = new Set(["-comic", "is:sfw", "order:random", "-loli", "-shota"]);
const MAX_TAGS = 12;

class DanbooruImageCommand {
  constructor(imageType) {
    this.imageType = imageType;
    this.defaultTags = new Set([...DEFAULT_TAGS, ...this.imageType.tags]);
    this.allowedTagCount = MAX_TAGS - this.defaultTags.size;

    this.slashCommand = new SlashCommandBuilder()
        .setName(this.imageType.name)
        .setDescription(`Searches for an image of a ${this.imageType.name}.`)
        .addStringOption(option => option
            .setName("tags")
            .setDescription(`Search up to ${this.allowedTagCount} tags. Separate tags with the $ symbol.`)
            .setRequired(false));
  }
 
  getCommand() {
    return {
      data: this.slashCommand,
      imageType: this.imageType,
      defaultTags: this.defaultTags,
      allowedTagCount: this.allowedTagCount,

      async execute(interaction) {
        const channel = interaction.channel;
        const requestedTags = this.splitRawTags(interaction.options.get("tags"));

        if (requestedTags.length > this.allowedTagCount) {
          await interaction.reply(`You can only have up to ${this.allowedTagCount} tags!`);
          return;
        }

        if (requestedTags.length > 0) {
          await interaction.reply(`Searching with tags: [ **${[...requestedTags].join(", ")}** ]`);
        } else {
          if (this.imageType === booruSearchTypes.ANY) {
            await interaction.reply("Searching for an image...");
          } else {
            await interaction.reply(`Searching for ${prefixWithAnOrA(this.imageType.name)}...`);
          }
        }

        let { validTags, userTags, invalidTags, isNsfw } = await this.parseTags(this.defaultTags, requestedTags);

        if (invalidTags.length > 0) {
          await interaction.editReply(`:x: Oops, I can't find the following ${maybePluralize("tag", invalidTags.length)} [ **${invalidTags.join(", ")}** ]`)
              .catch(ignore([UNKNOWN_MESSAGE]));
          return;
        }

        if (isNsfw && !channel.nsfw) {
          await interaction.editReply(":underage: I'm not allowed to post NSFW content in this channel")
              .catch(ignore([UNKNOWN_MESSAGE]));
          return;
        }

        let posts = await danbooru.getImage(validTags, 1);

        if (posts[0]) {
          await interaction.editReply(await this.generateMessagePayload(posts[0]))
              .catch(ignore([UNKNOWN_MESSAGE]));
        } else {
          if (this.imageType === booruSearchTypes.ANY) {
            await interaction.editReply(":x: I couldn't find an image with those tags")
                .catch(ignore([UNKNOWN_MESSAGE]));
          } else {
            await interaction.editReply(`:x: I couldn't find ${prefixWithAnOrA(this.imageType.name)} with those tags`)
                .catch(ignore([UNKNOWN_MESSAGE]));
          }
        }
      },

      splitRawTags(rawTags) {
        let splitTags = [];
        if (rawTags) {
          splitTags = rawTags.value.toLowerCase().split("$");
        }
        splitTags.forEach(t => t.trim());
        return splitTags.filter(t => t !== "");
      },

      async parseTags(defaultTags, requestedTags) {
        let validTags = new Set([...defaultTags]);

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
          validTags.add("random:1"); // will need to change if using more than 1 image at a time...
        }

        validTags = [...validTags]; // convert back to list from set
        let invalidTags = userTags.filter(t => t instanceof danbooru.InvalidTag).map(t => t.tag);
        let isNsfw = danbooru.hasNsfwTag(validTags);

        return {
          validTags: validTags,
          userTags: userTags.map(t => t.name || t),
          invalidTags: invalidTags,
          isNsfw: isNsfw
        };
      },

      async generateMessagePayload(post) {
        if (post.file_ext === "png" || post.file_ext === "jpg" ||
            post.file_ext === "jpeg" || post.file_ext === "gif") {
          let vibrant = new Vibrant(post.preview_file_url);
          let palette = await vibrant.getPalette();
      
          let embed = new MessageEmbed()
              .setDescription(
                  "Pictured: **" + danbooru.tagsToReadable(post.tag_string_character) + "**\n" +
                  "From: **" + danbooru.tagsToReadable(post.tag_string_copyright) + "**\n" +
                  "https://danbooru.donmai.us/posts/" + post.id
              )
              .setImage(post.large_file_url)
              .setColor(palette.Vibrant.hex);

          if (post.tag_string_character.split(" ").includes("vivy")) {
            embed.setFooter({ text: "❤️ That's me! ❤️" });
          }
      
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
    };
  }
}

module.exports = {
  booruSearchTypes,
  DanbooruImageCommand
};
