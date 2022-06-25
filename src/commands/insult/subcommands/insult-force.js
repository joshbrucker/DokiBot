const Discord = require("discord.js");

const InsultAccesor = require(__basedir + "/database/accessors/InsultAccessor.js");

async function execute(interaction) {
  let members = interaction.options.getString("members");
  let chooseableMembers = new Discord.Collection();

  if (members) {
    members = members.split("$");
    members.forEach(string => string.trim());
    for (let i = 0; i < members.length; i++) {
      let member = members[i];
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
        interaction.reply("Cannot find member " + members[i]);
        return;
      }
      chooseableMembers.set(fetchedMember.id, fetchedMember);
    }
  } else {
    chooseableMembers = interaction.guild.members.cache.filter(entry => !entry.user.bot);
  }

  let insult = await InsultAccesor.getRandomAccepted();
  let insultMessage = await insult.formatWithRandomUsers(interaction.guild, chooseableMembers, ignoreNotify=true);

  await interaction.reply(insultMessage);
}

module.exports = { execute };
