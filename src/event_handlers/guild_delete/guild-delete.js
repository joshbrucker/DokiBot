const db = require(__basedir + "/database/db.js");

let on_guild_delete = async function(client, guild) {
  await db.guild.removeGuild(guild.id);
}

module.exports = on_guild_delete;