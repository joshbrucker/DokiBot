const { emojiUtils } = require("@joshbrucker/discordjs-utils");

const { authorizationUrl } = require(__basedir + "/settings.json");

const GuildAccessor = require(__basedir + "/database/accessors/GuildAccessor.js");
const InsultAccessor = require(__basedir + "/database/accessors/InsultAccessor.js");
const sendInsult = require("./helpers/send-insult.js");
const dokiPoem = require("./helpers/poem-update.js");
const utils = require(__basedir + "/utils/utils.js");

async function onMessage(client, message) {
  if (message.author === client.user || message.author.bot) {
    return;
  }

  const guildData = await GuildAccessor.get(message.guild.id);

  // Migration to slash commands assistance
  let prefix = await utils.getPrefix(guildData.id);
  if (prefix && message.content.startsWith(prefix)) {
    message.channel.send(
        "Prefixed commands are **no longer** supported. Please use slash commands instead.\n\n" +
        "To disable this messeage, type `/disable`\n\n" +
        "If slash commands are not appearing, try reinviting the bot with this link:\n" +
        authorizationUrl
    );
  }

  const currDate = new Date();

  if (guildData.nextInsultTime <= currDate && guildData.allowInsults) {
    let insult = await InsultAccessor.getRandomAccepted();

    if (insult) {
      await sendInsult(client, message, insult);
      await guildData.updateNextInsultTime(utils.generateNewTime(currDate));
    } else {
      await message.channel.send("There are no insults added yet!");
    }
  }

  if (guildData.nextPoemUpdateTime <= currDate) {
    let time;
    switch(guildData.poemFrequency) {
      case "second":
        time = 1;
        break;
      case "minute":
        time = 60;
        break;
      case "hour":
        time = 60 * 60;
        break;
      case "day":
        time = 60 * 60 * 24;
        break;
    }

    await guildData.updateNextPoemUpdateTime(new Date(currDate.getTime() + time*1000));

    await dokiPoem(client, guildData, message);
  }
}

module.exports = onMessage;
