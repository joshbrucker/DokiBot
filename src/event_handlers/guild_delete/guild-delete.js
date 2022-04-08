const GuildModel = require(__basedir + "/database/models/GuildModel.js");

let onGuildDelete = async function(client, guild) {
  await GuildModel.remove(guild.id);
};

module.exports = onGuildDelete;