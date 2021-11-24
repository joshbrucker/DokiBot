const Discord = require("discord.js");
const danbooru = require(__basedir + "/external_services/danbooru/danbooru");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("waifu")
    .setDescription("Searches Danbooru for an image of a waifu.")
    .addStringOption(option =>
      option.setName("search_tags")
        .setDescription("Tags to search for. Separate tags with the $ symbol.")
        .setRequired(false)),

  async execute(interaction) {
    let channel = interaction.channel;
    let rawTags = interaction.options.get("search_tags");
    let tagList = [];

    if (rawTags) {
      tagList = rawTags.value.toLowerCase().split("$");
    }

    tagList.forEach(t => t.trim());

    if (tagList.length > 4) {
      await interaction.reply("You can only have up to 4 tags!");
      return;
    }

    if (tagList.length > 0) {
      await interaction.reply("Searching for tags: [ **" + tagList.join(", ") + "** ]");
    } else {
      await interaction.reply("Searching for a waifu...");
    }

    let parsedTags = [...new Set(await danbooru.generateTags(tagList, "girl"))];
    let invalidTags = parsedTags.filter(t => t instanceof danbooru.InvalidTag).map(t => t.tag);
    let isNsfw = danbooru.hasNsfwTag(parsedTags);

    if (invalidTags.length > 0) {
      await interaction.editReply("Oops, I can't find the following tag" + (invalidTags.length > 1 ? "s" : "") + ": " +
        "[ **" + invalidTags.join(", ") + "** ]");
      return;
    }

    if (isNsfw && !channel.nsfw) {
      await interaction.editReply(":underage: I'm not allowed to post NSFW content in this channel :underage:");
      return;
    }

    const post = await danbooru.getImage(parsedTags);
    if (post) {
      if (isNsfw && (post.tag_string.includes("loli") || post.tag_string.includes("shota"))) {
        await interaction.editReply(":x: I can't post this because it contains nsfw loli/shota!");
        return;
      }

      character = post.tag_string_character;
      series = post.tag_string_copyright;

      if (post.file_size < 8000000) {
        await interaction.editReply(
          new Discord.MessagePayload(channel, {
            content: "Pictured" + ": **" + danbooru.tagsToReadable(character) + "**\n" +
              "From: **" + danbooru.tagsToReadable(series) + "**",
            files: [ post.large_file_url ]
          })
        )
      } else {
        await interaction.editReply(
          "Pictured" + ": **" + danbooru.tagsToReadable(character) + "**\n" +
          "From: **" + danbooru.tagsToReadable(series) + "**\n" + post.large_file_url
        );
      }
    } else {
      await interaction.editReply(":x: I can't find a waifu with those tags!");
    }
  }
}