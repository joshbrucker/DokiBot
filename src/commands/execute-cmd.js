let Commands = require('./Commands.js');

let executeCmd = function(client, guild, message, args, cmd) {
  if (cmd == 'broadcast') {
    args = message.content.split(' ').splice(1);
    broadcast(message, args);
  } else if (cmd != 'submit') {
    args = args.map((arg) => arg.toLowerCase());
  }

  let command = Commands.get(cmd) || Commands.find(commandData => { return commandData.aliases && commandData.aliases.includes(cmd); });
  if (command) {
    command.run(client, guild, message, args);
  }
};

module.exports = executeCmd;