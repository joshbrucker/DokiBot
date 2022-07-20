const { handleDanbooruCommand, STARTING_MAX_TAGS, STARTING_DEFAULT_TAGS } = require("./DanbooruImageCommand");
const { SlashCommandBuilder } = require("@discordjs/builders");

const DEFAULT_TAGS = ["*girl"];

module.exports = {
  data: new SlashCommandBuilder()
      .setName("waifu")
      .setDescription("Posts an image of a waifu.")
      .addStringOption(option => option
          .setName("tags")
          .setDescription(`Search up to ${STARTING_MAX_TAGS - STARTING_DEFAULT_TAGS.length - DEFAULT_TAGS.length} tags. Separate tags with the $ symbol.`)
          .setRequired(false)),

  async execute(interaction) {
    let rawRequestedTags = interaction.options.getString("tags");
    await handleDanbooruCommand(interaction, "waifu", DEFAULT_TAGS, rawRequestedTags);
  }
};
