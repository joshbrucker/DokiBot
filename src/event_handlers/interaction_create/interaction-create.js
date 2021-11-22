const executeCmd = require(__basedir + "/commands/execute-cmd.js");

let interactionCreate = async function(client, interaction) {
    if (!interaction.isCommand()) return;

    let commandName = interaction.commandName;

    executeCmd(commandName, interaction);
};

module.exports = interactionCreate;