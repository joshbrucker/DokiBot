const { emojiUtils } = require("@joshbrucker/discordjs-utils");
const Discord = require("discord.js");

const InsultAccesor = require(__basedir + "/database/accessors/InsultAccessor.js");
const utils = require(__basedir + "/utils/utils.js");

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

  const insult = await InsultAccesor.getRandomAccepted();
  const insultMessage = insult ? await insult.formatWithRandomUsers(interaction.guild, chooseableMembers) : "There are no insults added yet!";
  const emoji = emojiUtils.formatForChat(await utils.randomDokiEmoji(interaction.client));

  const content = `==== ${emoji} Doki Doki Time! ${emoji} ====\n\n${insultMessage}\n\n=========================`;

  await interaction.reply(content);
}

module.exports = execute;
