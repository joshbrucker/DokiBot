const { SlashCommandBuilder } = require('@discordjs/builders');
const { SqlError } = require("mariadb");

const { adminUsers } = require(__basedir + "/settings.json");
const { runReadOnlyQuery } = require(__basedir + "/database/db.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("db")
      .setDescription("[Developer Command] Send a SQL query to the database (read-only).")
      .setDefaultPermission(false)
      .addStringOption(option => option
          .setName("query")
          .setDescription("The SQL query to send to the database.")
          .setRequired(true)),

  async execute(interaction) {
    if (!adminUsers.includes(interaction.user.id)) {
      interaction.reply("This command can only be run by DokiBot devs!");
      return;
    }

    try {
      let res = await runReadOnlyQuery(interaction.options.get("query").value);
      await interaction.reply("```json\n" + JSON.stringify(res, null, 2) + "\n```");
    } catch (err) {
      if (err instanceof SqlError) {
        await interaction.reply("```json\n" + err.text + "\n```");
      } else {
        throw err;
      }
    }
  },
};
