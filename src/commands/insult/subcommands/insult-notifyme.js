const GuildMemberAccessor = require(__basedir + "/database/accessors/GuildMemberAccessor.js");

async function execute(interaction) {
  let allow = interaction.options.getBoolean("allow");
  
  const guildMember = await GuildMemberAccessor.get(interaction.user.id, interaction.guild.id);
  await guildMember.updateNotifyMe(allow);

  await interaction.reply(`${allow ? "✅" : "🛑"} You **__${allow ? "will now" : "will no longer"}__** receive insult notifications.`);
}

module.exports = execute;
