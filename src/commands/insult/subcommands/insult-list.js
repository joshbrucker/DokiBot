const { EmbedBuilder } = require("discord.js");
const { PagedEmbed } = require("@joshbrucker/discordjs-utils");

const { capitalizeFirstLetter } = require(global.__basedir + "/utils/string-utils.js");
const InsultAccessor = require(global.__basedir + "/database/accessors/InsultAccessor.js");

async function execute(interaction) {
  let user = interaction.options.getUser("user");
  let status = interaction.options.getString("status");

  let insults = await InsultAccessor.getAllByMemberId(
    user ? user.id : interaction.user.id, 
    status ? status : ""
  );

  let pages = await splitIntoPages(interaction, insults, user, status);

  new PagedEmbed().send(interaction, pages);
}

async function splitIntoPages(interaction, insults, user, status) {
  const PAGE_LENGTH = 5;
  let pages = [];

  let description = "";

  for (let i = 0; i < insults.length; i++) {
    let formattedInsult = await insults[i].formatForListCommand(interaction.client);
    description += formattedInsult + "\n\n\n";

    if ((i + 1) % PAGE_LENGTH === 0 || (i + 1) === insults.length) {
      pages.push(generateResponse(user, status, description));
      description = "";
    }
  }

  if (pages.length === 0) {
    pages.push(generateResponse(user, status, "No insults found."));
  }

  return pages;
}

function generateResponse(user, status, description) {
  let username = user ? user.username + "'s" : "Your";

  let title = status ?
    `${username} ${capitalizeFirstLetter(status)} Insults` :
    `${username} Insults`;

  return new EmbedBuilder()
      .setTitle(title)
      .setDescription(description);
}

module.exports = { execute };
