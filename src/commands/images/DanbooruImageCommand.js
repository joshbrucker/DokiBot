const { SlashCommandBuilder } = require("@discordjs/builders");
const { ignore } = require("@joshbrucker/discordjs-utils");
const { Constants: { APIErrors: { UNKNOWN_MESSAGE }}} = require('discord.js');

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
        const requestedTags = splitRawTags(interaction.options.get("tags"));

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

        let { allTags, invalidTags, isNsfw } = await parseTags(this.defaultTags, requestedTags);

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

        let posts = await danbooru.getImage(allTags, 1);

        if (posts[0]) {
          await interaction.editReply(await danbooru.generateMessagePayload(posts[0]))
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

        function splitRawTags(rawTags) {
          let splitTags = [];
          if (rawTags) {
            splitTags = rawTags.value.toLowerCase().split("$");
          }
          splitTags.forEach(t => t.trim());
          return splitTags.filter(t => t !== "");
        }

        async function parseTags(defaultTags, requestedTags) {
          let allTags = [...(await danbooru.generateTags(defaultTags, requestedTags))];
          let invalidTags = allTags.filter(t => t instanceof danbooru.InvalidTag).map(t => t.tag);
          let isNsfw = danbooru.hasNsfwTag(allTags);

          return {
            allTags: allTags,
            invalidTags: invalidTags,
            isNsfw: isNsfw
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
