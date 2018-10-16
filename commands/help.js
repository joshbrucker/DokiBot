const helpText = require(__basedir + '/assets/help-text.json');
const utils = require(__basedir + '/utils/utils');

var help = function(message, args) {
 
    if (args.length > 0) {
        var command = helpText.commands.find((command) => {
            return command.name == args[0].toLowerCase();
        });

        if (command) {
            message.channel.send(command.text);
        } else {
            message.channel.send(helpText.invalidArg);
        }
    } else {
        message.channel.send(helpText.default)
    }
}

module.exports = help;
