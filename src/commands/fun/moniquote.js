const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

const { PagingResponse } = require(__basedir + "/classes/PagingResponse");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("moniquote")
    .setDescription("Replies with a quote from Monika."),

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
      msg += currLine.replace(/"/g, "").replace("[player]", interaction.user.username) + " ";
      currLine = lines[startIndices[quoteNum] + ++i];
    }

    msg = msg.split(/[\r\n]/g);

    // increase length of each page of text
    let finalMsg = [];
    for (let i = 0; i < msg.length; i++) {
      let current = msg[i];
      while (current.length <= 200 && (i + 1) < msg.length && !msg[i + 1].startsWith(" ...")) {
        current += msg[++i];
      }
      finalMsg.push(current);
    }
    finalMsg.push("END");


    let msgData = finalMsg.map(line => {
      return new Discord.MessagePayload(interaction.channel, {
        embeds: [
          new Discord.MessageEmbed({
            title: title,
            description: line
          })
        ]
      })
    });

    let pagingResponse = new PagingResponse(interaction, msgData, 60000);
    await pagingResponse.initialize();
  }
};
