const { TextInputComponent, Modal, MessageActionRow } = require("discord.js");
const { ignore } = require("@joshbrucker/discordjs-utils");

const GlobalMemberAccessor = require(global.__basedir + "/database/accessors/GlobalMemberAccessor.js");
const InsultAccessor = require(global.__basedir + "/database/accessors/InsultAccessor.js");
const { maybePluralize } = require(global.__basedir + "/utils/string-utils.js");
const { submissionChannel } = require(global.__basedir + "/settings.json").insults;
const { IGNORE_ERRORS } = require(global.__basedir + "/constants/constants.js");

async function execute(interaction) {
  const modal = new Modal()
      .setCustomId("insult-submit")
      .setTitle("Insult Submission")
      .setComponents([
        new MessageActionRow()
            .setComponents([
              new TextInputComponent()
                  .setCustomId("submission")
                  .setLabel("Submit your insult (once per day)")
                  .setPlaceholder("@user is a big meanie!")
                  .setStyle("SHORT")
                  .setMaxLength("200")
                  .setRequired(true)
            ])
      ]);

  let member = await GlobalMemberAccessor.get(interaction.user.id);
  let now = new Date();

  if (member.nextSubmitDate < now) {
    await interaction.showModal(modal);
  } else {
    await interaction.reply({
      content: `You cannot submit another insult for another ${getRemainingTimeString(member.nextSubmitDate - now)}`,
      ephemeral: true
    });
  }
}

async function handleModal(interaction) {
  let submission = interaction.fields.getTextInputValue("submission");

  if (!submission.includes("@user")) {
    await interaction.reply({
      content: "You must include `@user` at least once (or more!) in your submission, which is where DokiBot would notify someone.",
      ephemeral: true
    });
    return;
  }

  let member = await GlobalMemberAccessor.get(interaction.user.id);

  let insult = await InsultAccessor.add(submission, "pending", interaction.user.id);
  try {
    await sendInsultToSubmissionChannel(interaction, insult);
  } catch (err) {
    await InsultAccessor.remove(insult.id);
    console.log(err);
    await interaction.reply({
      content: "Couldn't send your submission to the DokiBot server. Is it down?",
      ephemeral: true
    });
    return;
  }

  await cacheSubmissionChannel(interaction.client);

  const tomorrow = new Date();
  tomorrow.setDate(new Date().getDate() + 1);

  await member.updateNextSubmitDate(tomorrow);

  await interaction.reply("📤  Submission has been sent! Use `/insult list` to view its status.\n```" + submission + "```");
}

async function sendInsultToSubmissionChannel(interaction, insult) {
  async function sendInsult(target, { submissionChannel, insult }) {
    const { emojiUtils } = require("@joshbrucker/discordjs-utils");
    let channel = await target.channels.resolve(submissionChannel);
  
    if (channel) {
      let sentMessage = await channel.send(`${insult.message}\n\n**ID:** ${insult.id}\n`)
          .catch(ignore(IGNORE_ERRORS.SEND));
      await emojiUtils.react(sentMessage, [ "✅", "❌" ]);
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

async function cacheSubmissionChannel(client) {
  async function cacheMessages(target, { submissionChannel }) {
    let channel = await target.channels.resolve(submissionChannel);
    if (channel) {
      await channel.messages.fetch();
    }
  }
  await client.shard.broadcastEval(cacheMessages, { context: { submissionChannel: submissionChannel }});
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

module.exports = { execute, handleModal };
