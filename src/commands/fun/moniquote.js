const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const { PagedEmbed } = require("@joshbrucker/discordjs-utils");
const { SlashCommandBuilder } = require("@discordjs/builders");

const colors = require(__basedir + "/resources/colors.json");
const { random } = require(__basedir + "/utils/utils.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("moniquote")
      .setDescription("Replies with a quote from Monika."),

  async execute(interaction) {
    const moniquoteDir = __basedir + "/resources/moniquotes";

    let dir = await fs.promises.readdir(moniquoteDir);
    let fileName = dir[random(dir.length)];
    let fileContents = await fs.promises.readFile(moniquoteDir + "/" + fileName);

    let title = fileName.substring(0, fileName.length - 4);
    let textLines = fileContents.toString()
        .replace("[player]", "**" + (interaction.member.nickname || interaction.user.username) + "**")
        .split("\n");

    let PAGE_LENGTH = 5;
    let pages = [];
    let descr = "";

    let i = 0;
    while (i < textLines.length) {
      for (let j = 0; j < PAGE_LENGTH && i < textLines.length; j++, i++) {
        descr += textLines[i] + "\n\n";
      }

      pages.push(
          new MessageEmbed()
              .setTitle(title)
              .setDescription(descr)
              .setColor(colors.monikaGreen)
              .setAuthor({ name: "Monika", url: "https://twitter.com/lilmonix3", iconURL: "attachment://monika.png" })
      );

      descr = "";
    }

    new PagedEmbed().send(interaction, pages, attachments=[__basedir + "/resources/images/monika.png"]);
  }
};
