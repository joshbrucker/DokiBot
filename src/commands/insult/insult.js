const { SlashCommandBuilder } = require("@discordjs/builders");

// Subcommands
const listSubcommand = require("./subcommands/insult-list.js");
const forceSubcommand = require("./subcommands/insult-force.js");
const notifySubcommand = require("./subcommands/insult-notify.js");
const submitSubcommand = require("./subcommands/insult-submit.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("insult")
    .setDescription("Commands for the insult feature.")
    .addSubcommand(subcommand => subcommand
        .setName("list")
        .setDescription("Lists your submitted insults.")
        .addUserOption(option => option
            .setName("user")
            .setDescription("A user to look up insults for.")
            .setRequired(false))
        .addStringOption(option => option
            .setName("status")
            .setDescription("Filter your insults by status.")
            .setRequired(false)
            .addChoices({ name: "Accepted", value: "accepted" }, { name: "Rejected", value: "rejected" }, { name: "Pending", value: "pending" })))
    .addSubcommand(subcommand => subcommand
        .setName("force")
        .setDescription("Forces an insult.")
        .addStringOption(option => option
            .setName("members")
            .setDescription("Members to be chosen for the insult. Separate multiple members with the $ symbol.")
            .setRequired(false)))
    .addSubcommand(subcommand => subcommand
        .setName("notify")
        .setDescription("Toggle whether DokiBot should @ you if your name is chosen for a random insult."))
    .addSubcommand(subcommand => subcommand
        .setName("submit")
        .setDescription("Submit an insult to be reviewed by the DokiBot team.")),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === "list") {
      listSubcommand.execute(interaction);
    } else if (interaction.options.getSubcommand() === "force") {
      forceSubcommand.execute(interaction);
    } else if (interaction.options.getSubcommand() === "notify") {
      notifySubcommand.execute(interaction);
    } else if (interaction.options.getSubcommand() === "submit") {
      submitSubcommand.execute(interaction);
    }
  },
};