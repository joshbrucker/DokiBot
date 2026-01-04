const { Vibrant } = require("node-vibrant/node");
const { default: nodeFetch, Headers } = require("node-fetch");

const { emojiUtils } = require("@joshbrucker/discordjs-utils");
const { submissionChannel } = require(global.__basedir + "/settings.json");
const { runQuery } = require(global.__basedir + "/database/db.js");

// temporary function to allow for servers to transition to new slash commands
async function getPrefix(guildId) {
  let response = await runQuery("SELECT prefix FROM guild WHERE id=?;", [ guildId ]);
  
  if (response.length > 0) {
    return response[0].prefix;
  }

  return null;
}

async function fetch(link, options) {
  let headers = new Headers({
    "User-Agent": "DokiBot/1.0"
  });
  let res = await nodeFetch(link, { ...options, headers: headers });
  return res;
}

async function generatePalette(src) {
  let res = await fetch(src);
  let buffer = Buffer.from(await res.arrayBuffer());
  let palette = await Vibrant.from(buffer).getPalette();

  return palette;
}

// Outputs a message with the given commands
function invalidArgsMsg(message, command) {
  message.channel.send(":x: **" + message.member.displayName + "**, that's not a valid use of `" + command + "`!\n" +
      "Use `help " + command + "` for more info.");
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

async function getAllHumanMembers(guild) {
  return guild.members.cache.filter(entry => !entry.user.bot);
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

function random(num) {
  return Math.floor(Math.random() * num);
}

async function randomDokiEmoji(client) {
  const rand = random(4);

  let doki;
  if (rand === 0) doki = "monika";
  else if (rand === 1) doki = "sayori";
  else if (rand === 2) doki = "natsuki";
  else if (rand === 3) doki = "yuri";

  return await emojiUtils.fetch(client, doki);
}

module.exports = {
  invalidArgsMsg,
  getAvailableChannel,
  getAllHumanMembers,
  generateNewTime,
  random,
  randomDokiEmoji,
  getPrefix,
  fetch,
  generatePalette
};
