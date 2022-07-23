const InsultAccessor = require(__basedir + "/database/accessors/InsultAccessor.js");

const { approvalsToAccept, rejectionsToDeny, submissionChannel } = require(__basedir + "/settings.json").insults;

let onMessageReactAdd = async function(client, reaction) {
  if (reaction.message.channel.id === submissionChannel) {
    let newStatus;

    if (reaction.emoji.toString() === "✅" && reaction.count - 1 >= approvalsToAccept) {
      newStatus = "accepted";
    } else if (reaction.emoji.toString() === "❌" && reaction.count - 1 >= rejectionsToDeny) {
      newStatus = "rejected";
    }

    if (newStatus) {
      let message = reaction.message;
      let content = message.content;

      let id = content.substring(content.length - 36);
      let insult = await InsultAccessor.get(id);
  
      if (insult) {
        await insult.updateStatus(newStatus, insult.id);
        await message.channel.messages.fetch();
        await message.delete();
      }
    }
  }
};

module.exports = onMessageReactAdd;
