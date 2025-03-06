const {
  ButtonBuilder,
  ActionRowBuilder
} = require("discord.js");
const { ignore } = require("@joshbrucker/discordjs-utils");

const emojiMap = require(global.__basedir + "/resources/emojiMap.json");
const utils = require(global.__basedir + "/utils/utils.js");
const { IGNORE_ERRORS } = require(global.__basedir + "/constants/constants.js");

async function sendInsult(client, message, insult) {
  const upvote = new ButtonBuilder()
      .setStyle("Secondary")
      .setLabel("0")
      .setEmoji(emojiMap.upvote)
      .setCustomId("upvote");

  const downvote = new ButtonBuilder()
      .setStyle("Secondary")
      .setLabel("0")
      .setEmoji(emojiMap.downvote)
      .setCustomId("downvote");

  let members = await utils.getAllHumanMembers(message.guild);
  let insultMessage = await insult.formatWithRandomGuildMembers(message.guild, members);

  let reply = await message.channel.send({
    content: insultMessage + "\n\u200b",
    components: [
      new ActionRowBuilder().addComponents([ upvote, downvote ])
    ],
    withResponse: true
  }).catch(ignore(IGNORE_ERRORS.SEND));

  // Return if the reply errored out due to no permissions
  if (!reply) return;

  const collector = reply.createMessageComponentCollector({
    time: 300000
  });

  const voteStatuses = {};

  collector.on("collect", async buttonInteraction => {
    collector.resetTimer();

    const member = buttonInteraction.member;

    if (!(member.id in voteStatuses)) {
      voteStatuses[member.id] = "";
    }

    let newUpvotes = parseInt(upvote.data.label);
    let newDownvotes = parseInt(downvote.data.label);

    if (buttonInteraction.customId === "upvote") {

      if (voteStatuses[member.id] === "upvote") {
        newUpvotes--;
        voteStatuses[member.id] = "";
      } else {
        if (voteStatuses[member.id] === "downvote") {
          newDownvotes--;
        }
        newUpvotes++;
        voteStatuses[member.id] = "upvote";
      }
    } else {
      if (voteStatuses[member.id] === "downvote") {
        newDownvotes--;
        voteStatuses[member.id] = "";
      } else {
        if (voteStatuses[member.id] === "upvote") {
          newUpvotes--;
        }
        newDownvotes++;
        voteStatuses[member.id] = "downvote";
      }
    }

    upvote.setLabel(newUpvotes.toString());
    downvote.setLabel(newDownvotes.toString());

    await buttonInteraction.update({
      components: [
        new ActionRowBuilder().addComponents([ upvote, downvote ])
      ]
    }).catch(ignore(IGNORE_ERRORS.UPDATE));
  });

  collector.on("end", async () => {
    upvote.setDisabled(true);
    downvote.setDisabled(true);

    if (reply.guild && reply.guild.available && reply.editable) {
      await reply.edit({
        components: [
          new ActionRowBuilder().addComponents([ upvote, downvote ])
        ]
      }).catch(ignore(IGNORE_ERRORS.EDIT));
    }

    if (insult) {
      await insult.addUpvotes(upvote.data.label);
      await insult.addDownvotes(downvote.data.label);
    }
  });
}

module.exports = sendInsult;