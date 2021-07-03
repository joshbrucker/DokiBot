const fs = require('fs');
const path = require('path');

const auth = require('./auth.json');

// Outputs a message with the given commands
let invalidArgsMsg = function(message, command) {
  message.channel.send(':x: **' + message.member.displayName + '**, that\'s not a valid use of \`' + command + '\`!\n'
    + 'Use \`' + 'help ' + command + '\` for more info.');
};

let getCustomEmoji = async function(client, emojiId) {
  let results = await client.shard.broadcastEval(`
      (async () => {
        const utils = require(__basedir + '/utils.js');
        const guild = await this.guilds.resolve('${auth.dokihubId}');
        if (guild) {
          let emoji = await guild.emojis.resolveID('${emojiId}');
          return emoji;
        } else {
          return null;
        }
      })();`);

  let emojis = results.filter((res) => res != null);
  return (emojis.length > 0) ? emojis[0] : null;
};

let sleep = function(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

let dateFormat = function(date) {
  return (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
};

let timeFormat = function(date) {
  return date.getHours() + ':' + ((date.getMinutes() >= 10) ? ':' : ':0') + date.getMinutes();
};

let getMonthName = function(int) {
  switch(int) {
    case 1:
      return 'January';
    case 2:
      return 'February';
    case 3:
      return 'March';
    case 4:
      return 'April';
    case 5:
      return 'May';
    case 6:
      return 'June';
    case 7:
      return 'July';
    case 8:
      return 'August';
    case 9:
      return 'September';
    case 10:
      return 'October';
    case 11:
      return 'November';
    case 12:
      return 'December';
  }
};

let secondsConverter = function(int) {
  let remaining = int;

  let days = Math.floor(remaining / 86400);
  if (days < 10) {
    days = '0' + days;
  }
  remaining = remaining % 86400;

  let hours = Math.floor(remaining / 3600);
  if (hours < 10) {
    hours = '0' + hours;
  }
  remaining = remaining % 3600;

  let minutes = Math.floor(remaining / 60);
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  remaining = Math.floor(remaining % 60);

  if (remaining < 10) {
    remaining = '0' + remaining;
  }

  return (days + ':' + hours + ':' + minutes + ':' + remaining);
};

let getAvailableChannel = function(client, guild) {
  let channels = guild.channels.cache.filter((channel) => (channel.type === 'text' && channel.permissionsFor(client.user).has('SEND_MESSAGES')
      && channel.permissionsFor(client.user).has('VIEW_CHANNEL')));

  if (channels.first()) {
    return channels.first();
  } else {
    return null;
  }
};

let sendWelcomeMsg = function(client, guild, channel) {
  let emoji = client.emojis.resolve('539122262347874334');

  let message = ('Square up! Your true love has joined the server. '
      + 'Here are a few helpful tips for using me! ' + emoji.toString() + '\n\n'
      + '```AsciiDoc\n'
      + 'Welcome to the Club!\n'
      + '====================\n\n'
      + '* [1] You may not want me posting in this channel. Use `-setchannel [channel]\' to set the default channel for me to post insults, etc.\n\n'
      + '* [2] Random insults are *disabled* by default. Use `-toggle\' to turn them on. '
      + 'They may not be appropriate for all club members, so enable them at your own discretion.\n\n'
      + '* [3] You can make a channel called `doki-poems\' where I can create my poems for you.\n\n'
      + '* [4] Use `-help\' to see more commands. Best of luck, dummies!```');

  channel.send(message);
};

let getMembers = function(guild) {
  let members = guild.members.cache.array();
  let humans = [];
  for (let i = 0; i < members.length; i++) {
    if (!members[i].user.bot) {
      humans.push(members[i]);
    }
  }
  return humans;
};

let generateNewTime = function(date) {
  let newDate = new Date(date);
  let hours = Math.floor(Math.random() * 24);
  let minutes = Math.floor(Math.random() * 64);

  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  newDate.setSeconds(0);
  newDate.setDate(newDate.getDate() + 1);

  return newDate;
};

let stripToNums = function(string) {
  return string.replace(/\D/g,'')
};

let random = function(num) {
  return Math.floor(Math.random() * num);
};

// Takes in an array of emojis and reacts in order
let react = async function(message, reactions) {
  let currEmoji = reactions.shift();
  try {
    await message.react(currEmoji);
    if (reactions.length > 0) {
      await react(message, reactions);
    }
  } catch (err) {
    if (err.message == 'Unknown Emoji' && currEmoji) {
      if (reactions.length > 0) {
        await react(message, reactions);
      }
    } else if (err.message != 'Unknown Message') {
      throw err;
    }
  }
};

module.exports = {
  invalidArgsMsg,
  getAvailableChannel,
  sendWelcomeMsg,
  getMembers,
  dateFormat,
  timeFormat,
  secondsConverter,
  getMonthName,
  generateNewTime,
  stripToNums,
  random,
  getCustomEmoji,
  react
};
