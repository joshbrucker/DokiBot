const {
  Constants: { APIErrors: { UNKNOWN_INTERACTION, UNKNOWN_MESSAGE }},
  MessageButton,
  MessageActionRow
} = require("discord.js");
const { ignore, emojiUtils } = require("@joshbrucker/discordjs-utils");

const emojiMap = require(__basedir + "/resources/emojiMap.json");

async function sendInsult(client, message, insult) {
  const upvote = new MessageButton({
    style: "SECONDARY",
    label: "0",
    emoji: await emojiUtils.fetch(client, emojiMap.upvote),
    customId: "upvote"
  });

  const downvote = new MessageButton({
    style: "SECONDARY",
    label: "0",
    emoji: await emojiUtils.fetch(client, emojiMap.downvote),
    customId: "downvote"
  });

  let members = message.guild.members.cache.filter(entry => !entry.user.bot);
  let insultMessage = await insult.formatWithRandomUsers(message.guild, members);

  let reply = await message.channel.send({
    content: insultMessage + "\n\u200b",
    components: [new MessageActionRow({components: [upvote, downvote]})],
    fetchReply: true
  });

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
      components: [new MessageActionRow({components: [upvote, downvote]})]
    }).catch(ignore([UNKNOWN_INTERACTION]));
  });

  collector.on("end", async () => {
    upvote.disabled = true;
    downvote.disabled = true;

    await reply.edit({
      components: [new MessageActionRow({components: [upvote, downvote]})]
    }).catch(ignore([UNKNOWN_MESSAGE]));

    if (insult) {
      await insult.addUpvotes(upvote.label);
      await insult.addDownvotes(downvote.label);
    }
  });
}

module.exports = sendInsult;