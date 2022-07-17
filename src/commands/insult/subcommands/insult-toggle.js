const { Permissions } = require("discord.js");

const GuildAccessor = require(__basedir + "/database/accessors/GuildAccessor.js");

async function execute(interaction) {
  if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
    let guild = await GuildAccessor.get(interaction.user.id, interaction.guild.id);
    await guild.updateAllowInsults(!guild.allowInsults);
    await interaction.reply(`${guild.allowInsults ? "✅" : "🛑"} Insults **__${guild.allowInsults ? "will now" : "will no longer"}__** appear randomly.`);  
  } else {
    await interaction.reply({ ephemeral: true, content: "Only users with the `MANAGE_GUILD` permission can toggle random insults." });
  }
}

module.exports = { execute };
