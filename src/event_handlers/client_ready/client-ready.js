const auth = require(__basedir + '/auth.json');
const db = require(__basedir + '/database/db.js');
const utils = require(__basedir + '/utils.js');

let on_client_ready = function(client) {
  startRepeatingActivityChange(client, 3600000);

  if (client.channels.resolve(auth.submissionChannelId)) {
    startRepeatingMessageCache(client, auth.submissionChannelId, 600000);
  }

  console.log('I am ready!');
}


let startRepeatingActivityChange = async function(client, delay) {
    // TODO: Change chance of getting guild based on total size
    let randomGuild = client.guilds.cache.random();
    let members = await randomGuild.members.fetch();
    members = members.filter((guildMember) => !guildMember.user.bot);

    let username;
    if (members.first()) {
      let randomMember = members.random();
      username = randomMember.nickname || randomMember.user.username;
    } else {
      username = 'no one in particular'
    }

    await client.user.setActivity('with ' + username);

    setTimeout(startRepeatingActivityChange, delay, client, delay);
};

let startRepeatingMessageCache = async function(client, channelId, delay) {
  await client.channels.resolve(channelId).messages.fetch();
  setTimeout(startRepeatingMessageCache, delay, client, channelId, delay);
};

module.exports = on_client_ready;