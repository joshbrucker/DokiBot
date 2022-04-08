const Cache = require(__basedir + "/cache/Cache.js");

async function execute(interaction, guildId) {
  const key = Cache.getGuildKey(guildId);
  const value = Cache.getRawCache().get(key);

  if (value) {
    await interaction.reply("```json\n" + JSON.stringify(value, null, 2) + "\n```");
  } else {
    await interaction.reply(`Can't find guild with id=**${guildId}**`);
  }
}

module.exports = execute;
