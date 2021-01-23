const db = require(__basedir + '/database/db.js');
const utils = require(__basedir + '/utils.js');

let on_guild_create = function(client, guild) {
  db.guild.addGuild(guild.id, () => {
    let defaultChannel = utils.getAvailableChannel(client, guild);
    if (defaultChannel) {
      utils.sendWelcomeMsg(client, guild, defaultChannel);
      db.guild.setDefaultChannel(guild.id, defaultChannel.id);
    }
  });
}

module.exports = on_guild_create;