const { SlashCommandBuilder } = require("@discordjs/builders");
const anilist = require(__basedir + "/external_services/anilist/anilist.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manga")
    .setDescription("Searches Anilist for a manga.")
    .addStringOption(option =>
      option.setName("title")
        .setDescription("The title of the manga to search for.")
        .setRequired(true)),

  async execute(interaction) {
    let title = interaction.options.get("title").value;
    let variables = { search: title };
    let query = `
      query ($search: String) {
        Media (search: $search, type: MANGA) {
          id
        }
      }
    `;

    let res = await anilist.query(query, variables);

    if (res.ok) {
      let json = await res.json();
      let data = json.data.Media;
      interaction.reply("https://anilist.co/manga/" + data.id);
    } else if (res.status === 404) {
      interaction.reply("I can't find that manga!");
    } else {
      interaction.reply("I'm having some issues reaching Anilist. Is it down?");
    }
  }
};