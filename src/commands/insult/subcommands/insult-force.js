const Discord = require("discord.js");

const InsultAccesor = require(global.__basedir + "/database/accessors/InsultAccessor.js");
const utils = require(global.__basedir + "/utils/utils.js");

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
          fetchedMember = await interaction.guild.members.fetch(member);
        }

        if (!fetchedMember) {
          let searchResults = await interaction.guild.members.search({ query: member, limit: 1 });
          fetchedMember = searchResults.first();
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
    chooseableMembers = await utils.getAllHumanMembers(interaction.guild);
  }

  let insult = await InsultAccesor.getRandomAccepted();
  let insultMessage = await insult.formatWithRandomUsers(interaction.guild, chooseableMembers, true);

  await interaction.reply(insultMessage);
}

module.exports = { execute };
