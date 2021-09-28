const Discord = require("discord.js");

const helpEmbed = require(__basedir + "/resources/help/help.json");
const cmdEmbed = require(__basedir + "/resources/help/cmds.json");

let help = function(client, guild, message, args) {
    if (args.length === 0) {
        let embed = JSON.parse(JSON.stringify(helpEmbed));
        embed.thumbnail = { url: client.user.avatarURL };
        for (let i = 0; i < embed.fields.length; i++) {
            embed.fields[i].value = embed.fields[i].value.replace(/%p/g, guild.prefix);
        }
        message.author.send(new Discord.MessageEmbed(embed));
    } else if (args.length === 1 && cmdEmbed[args[0]]) {
        let embed = JSON.parse(JSON.stringify(cmdEmbed[args[0]]));

        const attachment = new Discord.MessageAttachment(__basedir + "/resources/images/hacker.png", "hacker.png");
        let prettyCommand = args[0].replace(/^\w/, c => c.toUpperCase());

        embed.author = { name: "[" + prettyCommand + "] Command Help", icon_url: "attachment://hacker.png" };
        embed.color = 16734190;
        for (let i = 0; i < embed.fields.length; i++) {
            embed.fields[i].name = embed.fields[i].name.replace(/%p/g, guild.prefix);
            embed.fields[i].value = embed.fields[i].value.replace(/%p/g, guild.prefix);
        }
        message.channel.send(new Discord.MessageEmbed(embed).attachFiles(attachment));
    }
}

module.exports = help;
