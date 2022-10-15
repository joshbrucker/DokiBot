const Discord = require("discord.js");

const ModalHandlers = new Discord.Collection();
ModalHandlers.set("insult-submit", require("./insult/subcommands/insult-submit.js").handleModal);

module.exports = {
  ModalHandlers
};
