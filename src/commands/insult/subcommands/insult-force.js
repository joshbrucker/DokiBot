const Discord = require("discord.js");

const InsultAccesor = require(__basedir + "/database/accessors/InsultAccessor.js");
const utils = require(__basedir + "/utils/utils.js");

async function execute(interaction) {
  let requestedMembers = interaction.options.getString("members");
  let chooseableMembers = new Discord.Collection();

  if (requestedMembers) {
    requestedMembers = requestedMembers.split("$");
    requestedMembers.forEach(string => string.trim());
    for (let i = 0; i < requestedMembers.length; i++) {
      let member = requestedMembers[i];
      let fetchedMember;

      try {
        if (member.startsWith("<@!") && member.endsWith(">")) {
          member = member.substring(3, member.length - 1);
        }
        fetchedMember = await interaction.guild.members.fetch(member);
      } catch (err) {
        if (err.httpStatus !== 400) {
          throw err;
        }
      }

      if (!fetchedMember) {
        interaction.reply("Cannot find member **" + requestedMembers[i] + "**");
        return;
      }
      chooseableMembers.set(fetchedMember.id, fetchedMember);
    }
  } else {
    chooseableMembers = await utils.getAllHumanMembers(interaction.guild);
  }

  let insult = await InsultAccesor.getRandomAccepted();
  let insultMessage = await insult.formatWithRandomUsers(interaction.guild, chooseableMembers, ignoreNotify=true);

  await interaction.reply(insultMessage);
}

module.exports = { execute };
