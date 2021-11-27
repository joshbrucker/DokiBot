const db = require(__basedir + "/database/db.js");
const utils = require(__basedir + "/utils/utils.js");

let on_guild_create = async function(client, guild) {
  await db.guild.addGuild(guild.id);
  let defaultChannel = utils.getAvailableChannel(client, guild);
  if (defaultChannel) {
    sendWelcomeMsg(client, guild, defaultChannel);
    await db.guild.setDefaultChannel(guild.id, defaultChannel.id);
  }
}

let sendWelcomeMsg = async function(client, guild, channel) {
  let emoji = await utils.fetchEmoji(client, guild, channel, "natsuki");

  let message = ("Square up! Your true love has joined the server. "
      + "Here are a few helpful tips for using me!" + emoji + '\n\n'
      + "```AsciiDoc\n"
      + "Welcome to the Club!\n"
      + "====================\n\n"
      + "* [1] You may not want me posting in this channel. Use `-setchannel [channel]` to set the default channel for me to post insults, etc.\n\n"
      + "* [2] Random insults are *disabled* by default. Use `-toggle` to turn them on. "
      + "They may not be appropriate for all club members, so enable them at your own discretion.\n\n"
      + "* [3] You can make a channel called `doki-poems` where I can create my poems for you.\n\n"
      + "* [4] Use `-help` to see more commands. Best of luck, dummies!```");

  channel.send(message);
};

module.exports = on_guild_create;