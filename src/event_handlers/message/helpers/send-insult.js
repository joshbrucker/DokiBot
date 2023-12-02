const {
  ButtonBuilder,
  ActionRowBuilder
} = require("discord.js");
const { ignore, emojiUtils } = require("@joshbrucker/discordjs-utils");

const emojiMap = require(global.__basedir + "/resources/emojiMap.json");
const utils = require(global.__basedir + "/utils/utils.js");
const { IGNORE_ERRORS } = require(global.__basedir + "/constants/constants.js");

async function sendInsult(client, message, insult) {
  const upvote = new ButtonBuilder()
      .setStyle("SECONDARY")
      .setLabel("0")
      .setEmoji(await emojiUtils.fetch(client, emojiMap.upvote))
      .setCustomId("upvote");

  const downvote = new ButtonBuilder({
    style: "SECONDARY",
    label: "0",
    emoji: await emojiUtils.fetch(client, emojiMap.downvote),
    customId: "downvote"
  });

  let members = await utils.getAllHumanMembers(message.guild);
  let insultMessage = await insult.formatWithRandomUsers(message.guild, members);

  let reply = await message.channel.send({
    content: insultMessage + "\n\u200b",
    components: [
      new ActionRowBuilder().addComponents([ upvote, downvote ])
    ],
    fetchReply: true
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

    if (buttonInteraction.customId === "upvote") {
      if (voteStatuses[member.id] === "upvote") {
        upvote.label--;
        voteStatuses[member.id] = "";
      } else {
        if (voteStatuses[member.id] === "downvote") {
          downvote.label--;
        }
        upvote.label++;
        voteStatuses[member.id] = "upvote";
      }
    } else {
      if (voteStatuses[member.id] === "downvote") {
        downvote.label--;
        voteStatuses[member.id] = "";
      } else {
        if (voteStatuses[member.id] === "upvote") {
          upvote.label--;
        }
        downvote.label++;
        voteStatuses[member.id] = "downvote";
      }
    }

    await buttonInteraction.update({
      components: [
        new ActionRowBuilder().addComponents([ upvote, downvote ])
      ]
    }).catch(ignore(IGNORE_ERRORS.UPDATE));
  });

  collector.on("end", async () => {
    upvote.disabled = true;
    downvote.disabled = true;

    if (reply.guild && reply.guild.available && reply.editable) {
      await reply.edit({
        components: [
          new ActionRowBuilder().addComponents([ upvote, downvote ])
        ]
      }).catch(ignore(IGNORE_ERRORS.EDIT));
    }

    if (insult) {
      await insult.addUpvotes(upvote.label);
      await insult.addDownvotes(downvote.label);
    }
  });
}

module.exports = sendInsult;