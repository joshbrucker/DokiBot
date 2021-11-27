const utils = require(__basedir + "/utils/utils.js");
const db = require(__basedir + "/database/db.js");


let checkInsults = async function(client, dbGuild, message) {
  let guildNative = message.guild;

  let date = new Date();
  if (dbGuild.insult_time <= date && dbGuild.allow_insults === 1) {
    let insults = await db.insult.getInsults();

    let insult = insults[0].message;
    let userLocations = insult.match(/%user%/g).length;
    let members = message.guild.members.cache.filter(entry => !entry.user.bot);

    for (let j = 0; j < userLocations; j++) {
      let insultee = members.random().user;
      insult = insult.replace("%user%", "<@" + insultee.id + ">");

      if (members.length > 1) {
        members.delete(insultee.id);
      }
    }

    let channel = guildNative.channels.resolve(dbGuild.default_channel);
    try {
      channel.send(insult);
    } catch (ex) {
      console.log("exception");
      channel = utils.getAvailableChannel(client, guildNative);
      if (channel) {
        db.guild.setDefaultChannel(dbGuild.id, channel.id);
        channel.send("I couldn't find your default channel, so I set it to this channel. "
            + "If you want to change where I send messages, use the `setchannel` command!")
          .then(() => {
            channel.send(insult);
          });
      }
    }
    let newTime = utils.generateNewTime(date);
    db.guild.setInsultTime(guildNative.id, newTime);
  }
};

module.exports = checkInsults;