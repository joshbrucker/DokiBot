const GlobalMemberAccessor = require(__basedir + "/database/accessors/GlobalMemberAccessor.js");
const InsultAccessor = require(__basedir + "/database/accessors/InsultAccessor.js");

const { cacheSubmissionChannel } = require(__basedir + "/utils/utils.js");
const { maybePluralize } = require(__basedir + "/utils/string-utils.js");
const { submissionChannel } = require(__basedir + "/settings.json").insults;

async function execute(interaction) {
  let submission = interaction.options.getString("submission");

  if (!submission.includes(`<@!${interaction.client.user.id}>`)) {
      await interaction.reply(`You must include <@!${interaction.client.user.id}> at least once (or more!) in your submission. This is where DokiBot will insert a random user from your server.\n\n` +
        "__Example__\n" +
        `\`I heard that @${interaction.client.user.username} doesn't know how to use the submit feature! What a noob!\``);
    return;
  }

  if (submission.length > 300) {
    await interaction.reply("Your submission is too long! Cut it back a bit.");
    return;
  }

  let member = await GlobalMemberAccessor.get(interaction.user.id);
  let now = new Date();

  if (member.nextSubmitDate < now) {
    let insult = await InsultAccessor.add(submission.replaceAll(`<@!${interaction.client.user.id}>`, "%user%"), "pending", interaction.user.id);
    try {
      await sendInsultToSubmissionChannel(interaction, insult);
    } catch (err) {
      await InsultAccessor.remove(insult.id);
      console.log(err);
      await interaction.reply("Couldn't send your submission to the DokiBot server. Is it down?");
      return;
    }

    let tomorrow = new Date(now.setDate(now.getDate() + 1));
    await member.updateNextSubmitDate(tomorrow);

    await cacheSubmissionChannel(interaction.client);

    await interaction.reply("Submission has been sent! Use `/insult list` to view its status.");
  } else {
    await interaction.reply(`You cannot submit another insult for another ${getRemainingTimeString(member.nextSubmitDate - now)}`);
  }
}

async function sendInsultToSubmissionChannel(interaction, insult) {
  async function sendInsult(target, { submissionChannel, insult }) {
    const { emojiUtils } = require("@joshbrucker/discordjs-utils");
    let channel = await target.channels.resolve(submissionChannel);
  
    if (channel) {
      let messageContent = insult.message.replaceAll("%user%", `<@!${target.user.id}>`);
      let sentMessage = await channel.send(`${messageContent}\n\n**ID:** ${insult.id}\n`);
      await emojiUtils.react(sentMessage, ["✅", "❌"]);
      return true;
    } else {
      return false;
    }
  }

  await interaction.client.shard.broadcastEval(sendInsult, {
    context: {
      submissionChannel: submissionChannel,
      insult: insult,
    }
  });
}

function getRemainingTimeString(time) {
  let remaining = Math.abs(time);

  if (Math.ceil(remaining / 3600000) > 1) {
    return `**${Math.ceil(remaining / 3600000)}** hours!`;
  } else if (Math.ceil(remaining / 60000) > 1) {
    return `**${Math.ceil(remaining / 60000)}** minutes!`;
  } else {
    remaining = Math.ceil(remaining / 1000);
    return `**${remaining}** ${maybePluralize("second", remaining)}!`;
  }
}

module.exports = execute;
