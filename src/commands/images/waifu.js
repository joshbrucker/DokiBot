const danbooru = require(__basedir + "/external_services/danbooru");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("waifu")
      .setDescription("Searches Danbooru for an image of a waifu.")
      .addStringOption(option =>
          option.setName("search_tags")
              .setDescription("Search up to 8 tags. Separate tags with the $ symbol.")
              .setRequired(false)),

  async execute(interaction) {
    let channel = interaction.channel;
    let rawTags = interaction.options.get("search_tags");
    let tagList = [];

    if (rawTags) {
      tagList = rawTags.value.toLowerCase().split("$");
      tagList.forEach(t => t.trim());
      tagList = tagList.filter(t => t !== "");
    }

    if (tagList.length > 8) {
      await interaction.reply("You can only have up to 8 tags!");
      return;
    }

    if (tagList.length > 0) {
      await interaction.reply("Searching with tags: [ **" + tagList.join(", ") + "** ]");
    } else {
      await interaction.reply("Searching for a random waifu...");
    }

    let parsedTags = [...new Set(await danbooru.generateTags(tagList, "girl"))];
    let invalidTags = parsedTags.filter(t => t instanceof danbooru.InvalidTag).map(t => t.tag);
    let isNsfw = danbooru.hasNsfwTag(parsedTags);

    if (invalidTags.length > 0) {
      await interaction.editReply(":x: Oops, I can't find the following tag" + (invalidTags.length > 1 ? "s" : "") + ": " +
          "[ **" + invalidTags.join(", ") + "** ]");
      return;
    }

    if (isNsfw && !channel.nsfw) {
      await interaction.editReply(":underage: I'm not allowed to post NSFW content in this channel");
      return;
    }

    let posts = await danbooru.getImage(parsedTags, 1);

    if (posts[0]) {
      let post = posts[0];

      if (isNsfw && (post.tag_string.includes("loli") || post.tag_string.includes("shota"))) {
        await interaction.editReply(":police_car: I can't post this because it contains the tags NSFW and loli/shota");
        return;
      }

      await interaction.editReply(await danbooru.generateMessagePayload(post));
    } else {
      await interaction.editReply(":x: I couldn't find a waifu with those tags");
    }
  }
}
