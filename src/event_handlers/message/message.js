const { authorizationUrl } = require(__basedir + "/settings.json");
const { runQuery } = require(__basedir + "/database/db.js");

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
  let prefix = await getPrefix(guildData.id);
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
    await guildData.updateNextInsultTime(utils.generateNewTime(currDate));

    let insult = await InsultAccessor.getRandomAccepted();
    let members = message.guild.members.cache.filter(entry => !entry.user.bot);

    if (insult) {
      const insultMessage = await insult.formatWithRandomUsers(message.guild, members);
      const emoji = await utils.randomDokiEmoji(client);
      const content = `==== ${emoji} Doki Doki Time! ${emoji} ====\n\n${insultMessage}\n\n=========================`;
  
      await sendInsult(client, message, content, insult);
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

// temporary function to allow for servers to transition to new slash commands
async function getPrefix(guildId) {
  let response = await runQuery(`SELECT prefix FROM guild WHERE id=?;`, [guildId]);
  
  if (response.length > 0) {
    return response[0].prefix;
  }

  return null;
}

module.exports = onMessage;
