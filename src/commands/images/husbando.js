const { handleDanbooruCommand, MAX_TAG_COUNT, STARTING_DEFAULT_TAGS } = require("./DanbooruImageCommand");
const { SlashCommandBuilder } = require("@discordjs/builders");

const DEFAULT_TAGS = [ "*boy" ];

module.exports = {
  data: new SlashCommandBuilder()
      .setName("husbando")
      .setDescription("Posts an image of a husbando.")
      .addStringOption(option => option
          .setName("tags")
          .setDescription(`Search up to ${MAX_TAG_COUNT - STARTING_DEFAULT_TAGS.length - DEFAULT_TAGS.length} tags. Separate tags with the $ symbol.`)
          .setRequired(false)),

  async execute(interaction) {
    let rawRequestedTags = interaction.options.getString("tags");
    await handleDanbooruCommand(interaction, "husbando", DEFAULT_TAGS, rawRequestedTags);
  }
};
