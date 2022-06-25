const GuildMemberAccessor = require(__basedir + "/database/accessors/GuildMemberAccessor.js");

async function execute(interaction) { 
  let guildMember = await GuildMemberAccessor.get(interaction.user.id, interaction.guild.id);
  await guildMember.updateNotifyMe(!guildMember.insultNotify);

  await interaction.reply(`${guildMember.insultNotify ? "✅" : "🛑"} You **__${guildMember.insultNotify ? "will now" : "will no longer"}__** receive insult notifications.`);
}

module.exports = { execute };
