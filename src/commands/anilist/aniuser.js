const { SlashCommandBuilder } = require("@discordjs/builders");
const anilist = require(__basedir + "/external_services/anilist/anilist.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aniuser")
    .setDescription("Searches Anilist for a user.")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("The name of the user to search for.")
        .setRequired(true)),

  async execute(interaction) {
    let name = interaction.options.get("name").value;
    let variables = { search: name };
    let query = `
      query ($search: String) {
        User (search: $search) {
          id
        }
      }
    `;

    let res = await anilist.query(query, variables);

    if (res.ok) {
      let json = await res.json();
      let data = json.data.User;
      interaction.reply("https://anilist.co/user/" + data.id);
    } else if (res.status === 404) {
      interaction.reply("I can't find that user!");
    } else {
      interaction.reply("I'm having some issues reaching Anilist. Is it down?");
    }
  }
};