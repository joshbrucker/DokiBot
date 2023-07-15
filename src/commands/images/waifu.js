const { handleDanbooruCommand, MAX_TAG_COUNT, STARTING_DEFAULT_TAGS } = require("./DanbooruImageCommand");
const { SlashCommandBuilder } = require("@discordjs/builders");

const DEFAULT_TAGS = [ "*girl" ];

module.exports = {
  data: new SlashCommandBuilder()
      .setName("waifu")
      .setDescription("Posts an image of a waifu.")
      .addStringOption(option => option
          .setName("tags")
          .setDescription(`Search up to ${MAX_TAG_COUNT - STARTING_DEFAULT_TAGS.length - DEFAULT_TAGS.length} tags. Separate tags with commas or $ symbols.`)
          .setRequired(false)),

  async execute(interaction) {
    let rawRequestedTags = interaction.options.getString("tags");
    await handleDanbooruCommand(interaction, "waifu", DEFAULT_TAGS, rawRequestedTags);
  }
};
