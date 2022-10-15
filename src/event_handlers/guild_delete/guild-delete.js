const GuildAccessor = require(global.__basedir + "/database/accessors/GuildAccessor.js");

async function onGuildDelete(guild) {
  await GuildAccessor.remove(guild.id);
}

module.exports = onGuildDelete;