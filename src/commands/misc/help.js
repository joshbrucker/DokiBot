const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

const colors = require(global.__basedir + "/resources/colors.json");
const helpData = require(global.__basedir + "/resources/help/help.json");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("help")
      .setDescription("PMs you a list of all commands."),

  async execute(interaction) {
    let embed = new Discord.MessageEmbed()
        .setTitle(":sparkles: __**DokiBot Help**__ :sparkles:")
        .setDescription("Want to restrict commands to certain users/roles?\nAdmins can change perms for each command under:\n**Server Settings > Integrations > DokiBot**\n\n\u200b")
        .setColor(colors.dokiPink)
        .setThumbnail(interaction.client.user.avatarURL());

    for (let i = 0; i < helpData.length; i++) {
      let section = helpData[i];
      let name = section.category;
      let value = section.commands.map(command => `**${command.name}**\n${command.description}`).join("\n\n");

      embed.addFields([{ name: name + "\n\u200b", value: value + (i == helpData.length - 1 ? "" : "\n\n\n\u200b") }]);
    }

    try {
      let dmChannel = await interaction.user.createDM();
      await dmChannel.send({ embeds: [ new Discord.MessageEmbed(embed) ]})
          .catch(_ => {
            console.log("Unable to send DM! Do you have strict DM perms?");
          });
      interaction.reply({ ephemeral: true, content: "Sent help info to your DMs!" });
    } catch (error) {
      interaction.reply({ ephemeral: true, content: "I don't have permission to DM you :(. Here's a temporary command list just for you.", embeds: [ new Discord.MessageEmbed(embed) ]});
    }
  },
};
