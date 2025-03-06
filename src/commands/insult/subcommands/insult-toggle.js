const { PermissionFlagsBits, MessageFlags } = require("discord.js");

const GuildAccessor = require(global.__basedir + "/database/accessors/GuildAccessor.js");

async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply("This command is not available in DMs!");
    return;
  }

  if (interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    let guild = await GuildAccessor.get(interaction.guild.id);
    await guild.updateAllowInsults(!guild.allowInsults);
    await interaction.reply(`${guild.allowInsults ? "✅" : "🛑"} Insults **__${guild.allowInsults ? "will now" : "will no longer"}__** appear randomly.`);  
  } else {
    await interaction.reply({
      content: "Only users with the `MANAGE_GUILD` permission can toggle random insults.",
      flags: MessageFlags.Ephemeral
    });
  }
}

module.exports = { execute };
