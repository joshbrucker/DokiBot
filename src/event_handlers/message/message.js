const db = require(__basedir + '/database/db.js');
const executeCmd = require(__basedir + '/commands/execute-cmd.js');


const checkInsults = require('./helpers/check-insults.js');
const dokiReact = require('./helpers/doki-react.js');
const poemUpdate = require('./helpers/poem-update.js');

let on_message = function(client, message) {
  if (message.channel.name == 'doki-poems') {
    if (message.author != client.user)  {
      message.delete({ timeout: 20 })
        .catch((err) => {
          if (!(err.message == 'Unknown Message' && message.deleted)) {
            throw err;
          }
        });
      return;
    }
  }

  if (message.guild && !message.author.bot) {
    db.guild.getGuild(message.guild.id, (guild) => {
      guild = guild[0];
      let prefix = guild.prefix;
      let content = message.content;

      if (content.substring(0, prefix.length) == prefix && content.length > 1) {
          let args = content.substring(prefix.length).split(' ');
          let cmd = args[0].toLowerCase();
          args = args.splice(1);

          executeCmd(guild, message, args, cmd);
      } else {
        poemUpdate(client, guild, message);
      }

      let dokiReactChance = Math.floor(Math.random() * 2);
      if (dokiReactChance == 1) {
        dokiReact(client, message);
      }

      checkInsults(client, message, guild);
    });
  }
}

module.exports = on_message;