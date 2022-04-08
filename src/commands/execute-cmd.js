const { Commands, AdminCommands } = require("./Commands.js");

let executeCmd = function(name, interaction) {
  const command = Commands.get(name) || AdminCommands.get(name);
  if (command) {
    command.execute(interaction);
  }
};

module.exports = executeCmd;