const Discord = require("discord.js");

const InsultAccesor = require(global.__basedir + "/database/accessors/InsultAccessor.js");
const utils = require(global.__basedir + "/utils/utils.js");
const { insultsSentCounter } = require(global.__basedir + '/utils/metrics.js');

async function execute(interaction) {
  let requestedMembers = interaction.options.getString("members");
  let chooseableMembers = new Discord.Collection();

  if (requestedMembers) {
    requestedMembers = requestedMembers.split("$").map(string => string.trim());
    for (let i = 0; i < requestedMembers.length; i++) {
      let member = requestedMembers[i];
      let fetchedMember;

      try {
        if (member.startsWith("<@") && member.endsWith(">")) {
          let startIndex = 2;
          if (member.startsWith("<@!")) {
            startIndex = 3;
          }
          member = member.substring(startIndex, member.length - 1);
        }

        // MUST check if it is a number before fetch; otherwise, users can pass in "/" symbols that will throw errors.
        if (!isNaN(member)) {
          if (interaction.inGuild()) {
            fetchedMember = await interaction.guild.members.fetch(member);
          } else {
            fetchedMember = await interaction.client.users.fetch(member);  // If not in guild, try to resolve the provided user
          }
        }
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
    if (interaction.inGuild()) {
      chooseableMembers = await utils.getAllHumanMembers(interaction.guild);
    } else {
      chooseableMembers.set(interaction.user.id, interaction.user);  // If not in guild, choose the user who called the command
    }
  }

  let insult = await InsultAccesor.getRandomAccepted();

  let insultMessage;
  if (interaction.inGuild()) {
    insultMessage = await insult.formatWithRandomGuildMembers(interaction.guild, chooseableMembers, true);
  } else {
    insultMessage = await insult.formatWithRandomUsers(chooseableMembers, true);
  }

  interaction.reply(insultMessage);

  insultsSentCounter.inc({ trigger: 'command' });
}

module.exports = { execute };
