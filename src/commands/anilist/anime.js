const { SlashCommandBuilder } = require('@discordjs/builders');
const anilist = require(__basedir + "/external_services/anilist.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anime")
    .setDescription("Searches Anilist for an anime.")
    .addStringOption(option =>
      option.setName("title")
        .setDescription("The title of the anime to search for.")
        .setRequired(true)),

  async execute(interaction) {
    let title = interaction.options.get("title").value;
    let variables = { search: title };
    let query = `
      query ($search: String) {
        Media (search: $search, type: ANIME) {
          id
        }
      }
    `;

    let res = await anilist.query(query, variables);

    if (res.ok) {
      let json = await res.json();
      let data = json.data.Media;
      interaction.reply("https://anilist.co/anime/" + data.id);
    } else if (res.status === 404) {
      interaction.reply("I can't find that anime!");
    } else {
      interaction.reply("I'm having some issues reaching Anilist. Is it down?");
    }
  },
};
