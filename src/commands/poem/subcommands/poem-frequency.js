const GuildAccessor = require(__basedir + "/database/accessors/GuildAccessor.js");

async function execute(interaction) {
  let frequency = interaction.options.getString("interval");
  let guildData = await GuildAccessor.get(interaction.guild.id);

  await guildData.updateNextPoemUpdateTime(new Date());
  await guildData.updatePoemFrequency(frequency);

  await interaction.reply(`Updated poem frequency to grab a word every \`${frequency}\`.`);
}

module.exports = { execute };