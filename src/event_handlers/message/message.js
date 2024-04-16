const { ignore } = require("@joshbrucker/discordjs-utils");

const { IGNORE_ERRORS } = require(global.__basedir + "/constants/constants.js");
const GuildAccessor = require(global.__basedir + "/database/accessors/GuildAccessor.js");
const GuildMemberAccessor = require(global.__basedir + "/database/accessors/GuildMemberAccessor.js");
const InsultAccessor = require(global.__basedir + "/database/accessors/InsultAccessor.js");
const sendInsult = require("./helpers/send-insult.js");
const poemUpdate = require("./helpers/poem-update.js");
const utils = require(global.__basedir + "/utils/utils.js");

async function onMessage(client, message) {
  if (message.author === client.user || message.author.bot) {
    return;
  }

  const guildData = await GuildAccessor.get(message.guild.id);
  const guildMemberData = await GuildMemberAccessor.get(message.author.id, message.guild.id);

  // Message privacy - ignore message for user if they opted out
  if (guildMemberData.ignoreMe) return;

  const currDate = new Date();

  if (guildData.nextInsultTime <= currDate && guildData.allowInsults) {
    let insult = await InsultAccessor.getRandomAccepted();

    if (insult) {
      await sendInsult(client, message, insult);
      await guildData.updateNextInsultTime(utils.generateNewTime(currDate));
    } else {
      await message.channel.send("There are no insults added yet!")
          .catch(ignore(IGNORE_ERRORS.SEND));
    }
  }

  if (guildData.nextPoemUpdateTime <= currDate) {
    await poemUpdate(guildData, message);
  }
}

module.exports = onMessage;
