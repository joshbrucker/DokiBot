const Cache = require(global.__basedir + "/cache/Cache.js");

async function execute(interaction, memberId, guildId) {
  const key = Cache.getGuildMemberKey(memberId, guildId);
  const value = Cache.getRawCache().get(key);

  if (value) {
    await interaction.reply("```json\n" + JSON.stringify(value, null, 2) + "\n```");
  } else {
    await interaction.reply(`Can't find guild member with id=**${memberId}** and guild_id=**${guildId}**`);
  }
}

module.exports = execute;
