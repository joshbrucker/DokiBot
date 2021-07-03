const db = require(__basedir + '/database/db.js');
const executeCmd = require(__basedir + '/commands/execute-cmd.js');


const checkInsults = require('./helpers/check-insults.js');
const dokiReact = require('./helpers/doki-react.js');
const poemUpdate = require('./helpers/poem-update.js');

let on_message = async function(client, message) {
  if (message.channel.name == 'doki-poems') {
    if (message.author != client.user)  {
      try {
        await message.delete({ timeout: 20 });
      } catch (err) {
          if (!(err.message == 'Unknown Message' && message.deleted)) {
            throw err;
          }
      }
      return;
    }
  }

  if (message.author.bot || !message.guild) {
    return;
  }

  let guildData = await db.guild.getGuild(message.guild.id);
  let prefix = guildData.prefix;
  let content = message.content;

  if (content.substring(0, prefix.length) == prefix && content.length > 1) {
      let args = content.substring(prefix.length).split(' ');
      let cmd = args[0].toLowerCase();
      args = args.splice(1);

      executeCmd(client, guildData, message, args, cmd);
  } else {
    poemUpdate(client, guildData, message);
  }

  dokiReact(client, message);
  checkInsults(client, message, guildData)
}

module.exports = on_message;