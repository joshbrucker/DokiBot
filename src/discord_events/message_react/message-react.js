const db = require(__basedir + "/database/db.js");
const auth = require (__basedir + "/auth.json");

let on_message_react = async function(client, reaction) {
  if (reaction.message.channel.id === auth.submissionChannelId && reaction.count === 2) {
    let message = reaction.message;
    if (reaction.emoji.toString() === "✅") {
        let content = message.content.split('\n\n');
        
        let data = content.pop();
        data = data.split('\n');
        let id = data[0].split(' ')[1];

        // TODO: Change to get ALL users on shards
        let user = await client.users.fetch(id);
        await user.send("Your insult has been accepted!");
        await user.send(content.join(' '));

        db.insult.addInsult(content, id);
        message.delete();
    } else if (reaction.emoji.toString() === "❌") {
        message.delete();
    }
  }
}

module.exports = on_message_react;