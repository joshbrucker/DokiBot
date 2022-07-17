const { dokibotURL } = require(__basedir + "/settings.json");

const GuildAccessor = require(__basedir + "/database/accessors/GuildAccessor.js");
const GuildMemberAccessor = require(__basedir + "/database/accessors/GuildMemberAccessor.js");
const InsultAccessor = require(__basedir + "/database/accessors/InsultAccessor.js");
const sendInsult = require("./helpers/send-insult.js");
const dokiPoem = require("./helpers/poem-update.js");
const utils = require(__basedir + "/utils/utils.js");

async function onMessage(client, message) {
  if (message.author === client.user || message.author.bot) {
    return;
  }

  const guildData = await GuildAccessor.get(message.guild.id);
  const guildMemberData = await GuildMemberAccessor.get(message.author.id, message.guild.id);

  // Migration to slash commands assistance
  let prefix = await utils.getPrefix(guildData.id);
  if (prefix && message.content.startsWith(prefix) && !guildMemberData.disableSlashWarning) {
    message.channel.send(
        "Prefixed commands are **no longer** supported. Please use slash commands instead.\n\n" +
        "If slash commands are not appearing, have an admin reinvite the bot:\n" +
        dokibotURL
    );

    guildMemberData.updateDisableSlashWarning(true);
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
