const auth = require(__basedir + '/auth.json');
const db = require(__basedir + '/database/db.js');
const utils = require(__basedir + '/utils.js');

const setActivity = require('./set-activity.js');

let on_client_ready = function(client) {
  db.guild.verifyGuilds(client, (addedGuilds) => {
    for (let i = 0; i < addedGuilds.length; i++) {
      let defaultChannel = utils.getAvailableChannel(client, addedGuilds[i]);
      if (defaultChannel) {
        utils.sendWelcomeMsg(client, addedGuilds[i], defaultChannel);
        db.guild.setDefaultChannel(addedGuilds[i].id, defaultChannel.id);
      }
    }
  });

  setActivity(client);
  setInterval(() => {
    setActivity(client);
  }, 3600000);

  client.guilds.resolve(auth.dokihubId).channels.resolve(auth.submissionChannelId).messages.fetch();
  setInterval(() => {
    client.guilds.resolve(auth.dokihubId).channels.resolve(auth.submissionChannelId).messages.fetch();
  }, 600000);

  console.log('I am ready!');
}

module.exports = on_client_ready;