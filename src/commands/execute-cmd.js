let Commands = require("./Commands.js");

let executeCmd = function(name, interaction) {
  let command = Commands.get(name) || Commands.find(commandData => { return commandData.aliases && commandData.aliases.includes(name); });
  if (command) {
    command.execute(interaction);
  }
};

module.exports = executeCmd;