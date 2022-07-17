const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("Redirects to new music bot."),

  async execute(interaction) {
    interaction.reply("DokiBot no longer plays audio. **Vivy** now handles all the music!\nhttps://top.gg/bot/923347293195882547");
  },
};
