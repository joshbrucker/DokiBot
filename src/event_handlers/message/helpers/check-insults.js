const fs = require('fs');
const path = require('path');

const utils = require(__basedir + '/utils.js');
const db = require(__basedir + '/database/db.js');


let checkInsults = async function(client, message, guildDb) {
  let guildNative = message.guild;

  let date = new Date();
  if (guildDb['insult_time'] <= date && guildDb['allow_insults'] == 1) {
    db.insult.getInsults((insult) => {
      insult = insult[0].message;
      let insultees = insult.match(/%user%/g).length;
      let members = utils.getMembers(guildNative);

      for (let j = 0; j < insultees; j++) {
        let index = Math.floor(Math.random() * members.length);
        let insultee = members[index];
        insult = insult.replace('%user%', '<@' + insultee.id + '>');

        if (members.length > 1) {
          members.splice(index, 1);
        }
      }

      let channel = guildNative.channels.resolve(guildDb['default_channel']);
      try {
        channel.send(insult);
      } catch (ex) {
        console.log('exception');
        channel = utils.getAvailableChannel(client, guildNative);
        if (channel) {
          db.guild.setDefaultChannel(guildDb.id, channel.id);
          channel.send('I couldn\'t find your default channel, so I set it to this channel. '
              + 'If you want to change where I send messages, use the `setchannel` command!')
            .then(() => {
              channel.send(insult);
            });
        }
      }
      let newTime = utils.generateNewTime(date);
      db.guild.setInsultTime(guildNative.id, newTime);
    });
  }
};

module.exports = checkInsults;