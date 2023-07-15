const { handleDanbooruCommand, MAX_TAG_COUNT, STARTING_DEFAULT_TAGS } = require("./DanbooruImageCommand");
const { SlashCommandBuilder } = require("@discordjs/builders");


module.exports = {
  data: new SlashCommandBuilder()
      .setName("doki")
      .setDescription("Posts an image of a character from DDLC.")
      .addStringOption(option => option
          .setName("character")
          .setDescription(`A doki to look up.`)
          .setRequired(false)
          .addChoices({ name: "Monika", value: "monika_(doki_doki_literature_club) " }, { name: "Sayori", value: "sayori_(doki_doki_literature_club) " }, { name: "Natsuki", value: "natsuki_(doki_doki_literature_club) " }, { name: "Yuri", value: "yuri_(doki_doki_literature_club) " }))
      .addStringOption(option => option
          .setName("tags")
          .setDescription(`Search up to ${MAX_TAG_COUNT - STARTING_DEFAULT_TAGS.length - 2} tags. Separate tags with commas or $ symbols.`)
          .setRequired(false)),

  async execute(interaction) {
    let doki = interaction.options.getString("character") ?
        [ interaction.options.getString("character"), "1girl" ] :
        [ "doki_doki_literature_club", "" ]; // extra "blank" to match tag length of other option
    let rawRequestedTags = interaction.options.getString("tags");

    await handleDanbooruCommand(interaction, "doki", doki, rawRequestedTags);
  }
};