const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { runQuery } = require(__basedir + "/database/db.js");
const { getPrefix } = require(__basedir + "/utils/utils.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("disable")
      .setDescription("Disables the warning when trying to use prefixed commands.")
      .setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_GUILD),

  async execute(interaction) {
    let prefix = await getPrefix(interaction.guild.id);
    if (prefix) {
      await runQuery(`UPDATE guild SET prefix=null where id=?`, interaction.guild.id);
      await interaction.reply("Successfully disabled the prefixed command warning!");
    } else {
      await interaction.reply("The warning is already disabled.");
    }
  },
};
