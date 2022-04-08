const { SlashCommandBuilder } = require('@discordjs/builders');
const { runQuery } = require(__basedir + "/database/db.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("disable")
      .setDescription("Disables the prefixed command deprecation warning.")
      .setDefaultPermission(true),

  async execute(interaction) {
      await runQuery(`UPDATE guild SET prefix=null where id=?`, interaction.guild.id);
      await interaction.reply("Successfully disabled slash command warning!");
  },
};
