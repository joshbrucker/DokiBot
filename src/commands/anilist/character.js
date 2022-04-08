const { SlashCommandBuilder } = require("@discordjs/builders");
const anilist = require(__basedir + "/external_services/anilist.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("character")
    .setDescription("Searches Anilist for a character.")
    .addStringOption(option => option
        .setName("name")
        .setDescription("The name of the character to search for.")
        .setRequired(true)),

  async execute(interaction) {
    let name = interaction.options.get("name").value;
    let variables = { search: name };
    let query = `
      query ($search: String) {
        Character (search: $search) {
          id
        }
      }
    `;

    let res = await anilist.query(query, variables);

    if (res.ok) {
      let json = await res.json();
      let data = json.data.Character;
      interaction.reply("https://anilist.co/character/" + data.id);
    } else if (res.status === 404) {
      interaction.reply("I can't find that character!");
    } else {
      interaction.reply("I'm having some issues reaching Anilist. Is it down?");
    }
  }
};