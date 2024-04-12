const { SlashCommandBuilder } = require("@discordjs/builders");
const GuildMemberAccessor = require(global.__basedir + "/database/accessors/GuildMemberAccessor.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("ignoreme")
      .setDescription("Toggles whether DokiBot can see your non-slash-command messages (disables random trigger features).")
      .setDMPermission(false),

  async execute(interaction) {
    let guildMember = await GuildMemberAccessor.get(interaction.user.id, interaction.guild.id);
    await guildMember.updateIgnoreMe(!guildMember.ignoreMe);
    await interaction.reply(`${guildMember.ignoreMe ? "🛑" : "✅"} Your messages **__${guildMember.ignoreMe ? "will now" : "will no longer"}__** be ignored.\n\n` +
                            "This only affects features triggered by messages, such as grabbing words for poems, randomly sending poems/insults, etc. Slash commands will continue to be enabled for you.");
  },
};
