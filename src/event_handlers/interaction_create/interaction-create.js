const auth = require(__basedir + "/auth.json");
const executeCmd = require(__basedir + "/commands/execute-cmd.js");

let interactionCreate = async function(client, interaction) {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;
  executeCmd(commandName, interaction);
};

module.exports = interactionCreate;