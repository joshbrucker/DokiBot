const emojis = require(__basedir + "/resources/emojis.json");
const auth = require(__basedir + "/auth.json");

// Outputs a message with the given commands
function invalidArgsMsg(message, command) {
  message.channel.send(":x: **" + message.member.displayName + "**, that's not a valid use of \`" + command + "\`!\n" +
      "Use \`help " + command + "\` for more info.");
}

async function fetchEmoji(client, guild, channel, name) {
  function findEmoji(target, { dokihubId, nameOrID }) {
    if (target.guilds.resolve(dokihubId)) {
      const emoji = target.emojis.cache.get(nameOrID) || target.emojis.cache.find(e => e.name.toLowerCase() === nameOrID.toLowerCase());
      if (!emoji) return null;
      return emoji;
    }
  }

  let emoji = "";

  if (guild.me.permissionsIn(channel).has("USE_EXTERNAL_EMOJIS")) {
    emojiArray = await client.shard.broadcastEval(findEmoji, { context: { dokihubId: auth["dokihubId"], nameOrID: emojis[name] }});
    const foundEmoji = emojiArray.find(emoji => emoji);
    emoji = foundEmoji.animated ? `<${foundEmoji.identifier}>` : `<:${foundEmoji.identifier}>`;
  }

  return emoji;
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function dateFormat(date) {
  return (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();
}

function timeFormat(date) {
  return date.getHours() + ":" + ((date.getMinutes() >= 10) ? ":" : ":0") + date.getMinutes();
}

function getMonthName(int) {
  switch(int) {
    case 1:
      return "January";
    case 2:
      return "February";
    case 3:
      return "March";
    case 4:
      return "April";
    case 5:
      return "May";
    case 6:
      return "June";
    case 7:
      return "July";
    case 8:
      return "August";
    case 9:
      return "September";
    case 10:
      return "October";
    case 11:
      return "November";
    case 12:
      return "December";
  }
}

function secondsConverter(int) {
  let remaining = int;

  let days = Math.floor(remaining / 86400);
  if (days < 10) {
    days = "0" + days;
  }
  remaining = remaining % 86400;

  let hours = Math.floor(remaining / 3600);
  if (hours < 10) {
    hours = "0" + hours;
  }
  remaining = remaining % 3600;

  let minutes = Math.floor(remaining / 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  remaining = Math.floor(remaining % 60);

  if (remaining < 10) {
    remaining = "0" + remaining;
  }

  return (days + ":" + hours + ":" + minutes + ":" + remaining);
}

function getAvailableChannel(client, guild) {
  let channels = guild.channels.cache.filter((channel) =>
      channel.type === "text" &&
      channel.permissionsFor(client.user).has("SEND_MESSAGES" &&
      channel.permissionsFor(client.user).has("VIEW_CHANNEL")));

  if (channels.first()) {
    return channels.first();
  } else {
    return null;
  }
}

function getMembers(guild) {
  let members = guild.members.cache.array();
  let humans = [];
  for (let i = 0; i < members.length; i++) {
    if (!members[i].user.bot) {
      humans.push(members[i]);
    }
  }
  return humans;
}

function generateNewTime(date) {
  let newDate = new Date(date);
  let hours = Math.floor(Math.random() * 24);
  let minutes = Math.floor(Math.random() * 64);

  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  newDate.setSeconds(0);
  newDate.setDate(newDate.getDate() + 1);

  return newDate;
}

function stripToNums(string) {
  return string.replace(/\D/g,"");
}

function random(num) {
  return Math.floor(Math.random() * num);
}

// Takes in an array of emojis and reacts in order
async function react(message, reactions) {
  let currEmoji = reactions.shift();
  try {
    await message.react(currEmoji);
    if (reactions.length > 0) {
      await react(message, reactions);
    }
  } catch (err) {
    if (err.message === "Unknown Emoji" && currEmoji) {
      if (reactions.length > 0) {
        await react(message, reactions);
      }
    } else if (err.message !== "Unknown Message") {
      throw err;
    }
  }
};

function insertPrefix(dbGuild, string) {
  return string.replace(/%p/g, dbGuild.prefix);
}

function prefixWithAnOrA(word, capitalize=false) {
  let result = (word.startsWith("a") || word.startsWith("e") || word.startsWith("i") ||
      word.startsWith("o") || word.startsWith("u")) ? "an" : "a";

  return (capitalize ? result[0].toUpperCase() : result) + " " + word;
}

function maybePluralize(count, noun, suffix="s") {
  return `${count} ${noun}${count !== 1 ? suffix : ''}`;
}

module.exports = {
  invalidArgsMsg,
  getAvailableChannel,
  getMembers,
  dateFormat,
  timeFormat,
  secondsConverter,
  getMonthName,
  generateNewTime,
  stripToNums,
  random,
  fetchEmoji,
  react,
  capitalizeFirstLetter,
  insertPrefix,
  prefixWithAnOrA,
  maybePluralize
};
