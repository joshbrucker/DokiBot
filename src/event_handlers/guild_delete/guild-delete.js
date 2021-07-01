const db = require(__basedir + '/database/db.js');
const voiceManager = require(__basedir + '/voice/voice-manager.js');

let on_guild_delete = async function(client, guild) {
  await db.guild.removeGuild(guild.id);
  voiceManager.removeServer(guild.id);
}

module.exports = on_guild_delete;