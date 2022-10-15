const { SlashCommandBuilder } = require("@discordjs/builders");

// Subcommands
const endSubcommand = require("./subcommands/poem-end.js");
const frequencySubcommand = require("./subcommands/poem-frequency.js");
module.exports = {
  data: new SlashCommandBuilder()
      .setName("poem")
      .setDescription("Commands for the poem feature.")
      .addSubcommand(subcommand => subcommand
          .setName("end")
          .setDescription("Ends and outputs the current poem."))
      .addSubcommand(subcommand => subcommand
          .setName("frequency")
          .setDescription("Sets the frequency in which DokiBot grabs a random word for the poem. Default is \"hour\".")
          .addStringOption(option => option
              .setName("interval")
              .setDescription("Time interval for grabbing a word.")
              .setRequired(true)
              .addChoices({ name: "day", value: "day" }, { name: "hour", value: "hour" }, { name: "minute", value: "minute" }, { name: "second", value: "second" }))),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === "end") {
      endSubcommand.execute(interaction);
    } else if (interaction.options.getSubcommand() === "frequency") {
      frequencySubcommand.execute(interaction);
    }
  },
};