const GuildAccessor = require(__basedir + "/database/accessors/GuildAccessor.js");

async function onGuildCreate(guild) {
  await GuildAccessor.add(guild.id);
}

module.exports = onGuildCreate;
