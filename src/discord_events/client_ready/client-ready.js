const sample = require("alias-sampling");

const auth = require(__basedir + "/auth.json");

let on_client_ready = function(client) {
  //startRepeatingActivityChange(client, 3600000);

  if (client.channels.resolve(auth.submissionChannelId)) {
    startRepeatingMessageCache(client, auth.submissionChannelId, 600000);
  }

  console.log('I am ready!');
}

let startRepeatingActivityChange = async function(client, delay) {
  let guilds = client.guilds.cache;
  let guildIds = guilds.map((guild) => guild.id);
  let memberCounts = guilds.map((guild) => guild.memberCount);

  let message = 'by myself';
  if (guildIds.length > 0) {
    let sampler = sample(memberCounts, guildIds);
    let guild = client.guilds.resolve(sampler.next());
    if (guild) {
      let member = guild.members.cache.random();
      if (member) {
        message = 'with ' + (member.nickname || member.user.username);
      }
    }
  }
  await client.user.setActivity(message);

  setTimeout(startRepeatingActivityChange, delay, client, delay);
};

let startRepeatingMessageCache = async function(client, channelId, delay) {
  await client.channels.resolve(channelId).messages.fetch();
  setTimeout(startRepeatingMessageCache, delay, client, channelId, delay);
};

module.exports = on_client_ready;