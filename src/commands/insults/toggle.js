const db = require(__basedir + "/database/db.js");

let toggle = async function(client, dbGuild, message, args) {
    let channel = message.channel;

    if (!message.member.hasPermission("MANAGE_GUILD")) {
        channel.send("You need the **Manage Server** permission to use this command!");
        return;
    }

    await db.guild.toggleInsults(message.guild.id);

    if (dbGuild.allow_insults === 1) {
        channel.send("Disabled random insults!");
    } else {
        channel.send("Enabled random insults!")
    }
};

module.exports = toggle;