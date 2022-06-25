const { emojiUtils } = require("@joshbrucker/discordjs-utils");

const { ignoreMarkdown } = require(__basedir + "/utils/string-utils.js");
const emojiMap = require(__basedir + "/resources/emojiMap.json");
const InsultModel = require(__basedir + "/database/models/InsultModel.js");
const GuildMemberAccessor = require(__basedir + "/database/accessors/GuildMemberAccessor.js");


class Insult extends InsultModel {
  constructor(id, status, message, memberId, upvotes, downvotes) {
    super(id, status, message, memberId, upvotes, downvotes);
  }

  async formatForListCommand(client) {
    let statusEmoji = "";
    if (this.status === "pending") {
      statusEmoji = "❔";
    } else if (this.status === "accepted") {
      statusEmoji = "✅";
    } else if (this.status === "rejected") {
      statusEmoji = "❌";
    }

    const upvoteEmoji = emojiUtils.formatForChat(await emojiUtils.fetch(client, emojiMap.upvote));
    const downvoteEmoji = emojiUtils.formatForChat(await emojiUtils.fetch(client, emojiMap.downvote));

    return `${statusEmoji} \u200b **|** \u200b ${this.message}` +
        ((this.status === "accepted") ? ` \u200b **|** \u200b ${this.upvotes} ${upvoteEmoji} \u200b **|** \u200b ${this.downvotes} ${downvoteEmoji}` : "");
  }

  async formatWithRandomUsers(guild, members, ignoreNotify=false) {
    let insultMessage = this.message;

    if (members.size > 0) {
      const userMatch = insultMessage.match(/@user/g);
      const matchCount = userMatch ? userMatch.length : 0;
      for (let j = 0; j < matchCount; j++) {
        const insultee = members.random();
        const guildMember = await GuildMemberAccessor.get(insultee.id, guild.id);

        if (guildMember.insultNotify && !ignoreNotify) {
          insultMessage = insultMessage.replace("@user", "<@!" + insultee.id + ">");
        } else {
          insultMessage = insultMessage.replace("@user", "**__" + (insultee.nickname || insultee.user.username) + "__**");
        }

        if (members.size > 1) {
          members.delete(insultee.id);
        }
      }
    } else {
      insultMessage += "\n(No members found... is anyone around?)";
    }

    return insultMessage;
  }
}

module.exports = Insult;
