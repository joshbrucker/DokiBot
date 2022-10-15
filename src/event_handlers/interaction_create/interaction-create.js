const { Commands } = require(global.__basedir + "/commands/Commands.js");
const { ModalHandlers } = require(global.__basedir + "/commands/ModalHandlers.js");

async function interactionCreate(client, interaction) {
  if (interaction.isCommand()) {
    const commandName = interaction.commandName;
    const command = Commands.get(commandName);
    if (command) {
      command.execute(interaction);
    }
  } else if (interaction.isModalSubmit()) {
    const modalId = interaction.customId;
    const modalHandler = ModalHandlers.get(modalId);
    if (modalHandler) {
      modalHandler(interaction);
    }
  }
}

module.exports = interactionCreate;