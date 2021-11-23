const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("moniquote")
    .setDescription("Replies with a quote from Monica."),

  async execute(interaction) {
    let text = await fs.promises.readFile(__basedir + "/resources/moniquote.txt");

    let lines = text.toString().split('\n');
    let startIndices = [0];


    for (let i = 0; i < lines.length; i++) {
      if (lines[i].replace(/[\n\r]/g, "") === "" && lines[i + 1] !== undefined) {
        startIndices.push(i + 1);
      }
    }

    let quoteNum = Math.floor(Math.random() * startIndices.length);

    let msg = "";
    let title = lines[startIndices[quoteNum]];

    let i = 1;
    let currLine = lines[startIndices[quoteNum] + i];
    while (currLine && currLine.replace(/[\r\n]/g, "") !== "") {
      msg += " " + currLine.replace(/"/g, "").replace(/[\r\n]/g, "\n\n").replace("[player]", interaction.user.username);
      currLine = lines[startIndices[quoteNum] + ++i];
    }

    msg = msg.slice(0, msg.length - 1);

    interaction.reply(new Discord.MessagePayload(interaction.channel, {
      embeds: [
        new Discord.MessageEmbed({
          title: title,
          description: msg
        })
      ]
    }));
  }
};
