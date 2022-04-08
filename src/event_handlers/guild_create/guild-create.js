const GuildModel = require(__basedir + "/database/models/GuildModel.js");
const utils = require(__basedir + "/utils/utils.js");

async function onGuildCreate(guild) {
  await GuildModel.add(guild.id);
}

module.exports = onGuildCreate;
