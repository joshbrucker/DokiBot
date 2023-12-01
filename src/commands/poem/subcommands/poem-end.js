const { EmbedBuilder } = require("discord.js");

const GuildAccessor = require(global.__basedir + "/database/accessors/GuildAccessor.js");

async function execute(interaction) {
  let guildData = await GuildAccessor.get(interaction.guild.id);

  if (guildData.currentPoem === null) {
    await interaction.reply("There is no current poem!");
    return;
  }

  let embed = new EmbedBuilder()
      .setTitle("Your Poem")
      .setDescription(guildData.currentPoem);

  await interaction.reply({ embeds: [ embed ]});

  await guildData.updateNextPoemUpdateTime(new Date());
  await guildData.updateCurrentPoem(null);
}

module.exports = { execute };