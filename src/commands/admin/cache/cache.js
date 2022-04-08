const { SlashCommandBuilder } = require('@discordjs/builders');

const guildSubcommand = require("./subcommands/cache-guild.js");
const globalMemberSubcommand = require("./subcommands/cache-global-member.js");
const guildMemberSubcommand = require("./subcommands/cache-guild-member.js");
const flushSubcommand = require("./subcommands/cache-flush.js");

const { adminUsers } = require(__basedir + "/settings.json");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("cache")
      .setDescription("[Developer Command] View current caches.")
      .setDefaultPermission(false)
      .addSubcommand(subcommand => subcommand
          .setName("guild")
          .setDescription("[Developer Command] Retrieve an entry from the current guild cache.")
          .addStringOption(option => option
              .setName("guild_id")
              .setDescription("The guild ID to search the cache for.")
              .setRequired(true)))
      .addSubcommand(subcommand => subcommand
          .setName("global_member")
          .setDescription("[Developer Command] Retrieve an entry from the current global member cache.")
          .addStringOption(option => option
              .setName("member_id")
              .setDescription("The member ID to search the cache for.")
              .setRequired(true)))
      .addSubcommand(subcommand => subcommand
          .setName("guild_member")
          .setDescription("[Developer Command] Retrieve an entry from the current guild member cache.")
          .addStringOption(option => option
              .setName("member_id")
              .setDescription("The member ID to search the cache for.")
              .setRequired(true))
          .addStringOption(option => option
              .setName("guild_id")
              .setDescription("The guild ID to search the cache for.")
              .setRequired(true)))
      .addSubcommand(subcommand => subcommand
          .setName("flush")
          .setDescription("[Developer Command] Flushes the cache.")),

  async execute(interaction) {
    if (!adminUsers.includes(interaction.user.id)) {
      interaction.reply("This command can only be run by DokiBot devs!");
      return;
    }

    if (interaction.options.getSubcommand() === "guild") {
      const guildId = interaction.options.getString("guild_id");
      await guildSubcommand(interaction, guildId);

    } else if (interaction.options.getSubcommand() === "global_member") {
      const memberId = interaction.options.getString("member_id");
      await globalMemberSubcommand(interaction, memberId);

    } else if (interaction.options.getSubcommand() === "guild_member") {
      const memberId = interaction.options.getString("member_id");
      const guildId = interaction.options.getString("guild_id");
      await guildMemberSubcommand(interaction, memberId, guildId);
      
    } else if (interaction.options.getSubcommand() === "flush") {
      await flushSubcommand(interaction);
    }
  },
};
