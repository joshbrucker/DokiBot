const Cache = require(__basedir + "/cache/Cache.js");

async function execute(interaction, memberId) {
  const key = Cache.getGlobalMemberKey(memberId);
  const value = Cache.getRawCache().get(key);

  if (value) {
    await interaction.reply("```json\n" + JSON.stringify(value, null, 2) + "\n```");
  } else {
    await interaction.reply(`Can't find global member with id=**${memberId}**`);
  }
}

module.exports = execute;
