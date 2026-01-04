const { TextInputBuilder, ModalBuilder, ActionRowBuilder, MessageFlags } = require("discord.js");

const GlobalMemberAccessor = require(global.__basedir + "/database/accessors/GlobalMemberAccessor.js");
const InsultAccessor = require(global.__basedir + "/database/accessors/InsultAccessor.js");
const { maybePluralize } = require(global.__basedir + "/utils/string-utils.js");
const { submissionChannel } = require(global.__basedir + "/settings.json").insults;

async function execute(interaction) {
  const modal = new ModalBuilder()
      .setCustomId("insult-submit")
      .setTitle("Insult Submission")
      .setComponents([
        new ActionRowBuilder()
            .setComponents([
              new TextInputBuilder()
                  .setCustomId("submission")
                  .setLabel("Submit your insult (once per day)")
                  .setPlaceholder("@user is a big meanie!")
                  .setStyle("Short")
                  .setMaxLength(200)
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
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleModal(interaction) {
  let submission = interaction.fields.getTextInputValue("submission");

  if (!submission.includes("@user")) {
    await interaction.reply({
      content: "You must include `@user` at least once (or more!) in your submission, which is where DokiBot would notify someone.",
      flags: MessageFlags.Ephemeral
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
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const tomorrow = new Date();
  tomorrow.setDate(new Date().getDate() + 1);

  await member.updateNextSubmitDate(tomorrow);

  await interaction.reply("📤  Submission has been sent! Use `/insult list` to view its status.\n```" + submission + "```");
}

async function sendInsultToSubmissionChannel(interaction, insult) {
  async function sendInsult(target, { submissionChannel, insult }) {
    const { ignore, emojiUtils } = require("@joshbrucker/discordjs-utils");
    const { IGNORE_ERRORS } = require(global.__basedir + "/constants/constants.js");

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
