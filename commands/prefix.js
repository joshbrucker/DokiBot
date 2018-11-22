const fs = require('fs');
const path = require('path');

const db = require(__basedir + '/utils/db');
const utils = require(__basedir + '/utils/utils');

var prefix = function(message, args) {
    if (args.length == 1) {
        if (args[0].length <= 3) {
            db.savePrefix(message.guild.id, args[0], () => {
                message.channel.send('Prefix has been updated to `' + args[0] + '`');
            });
        } else {
            message.channel.send('Prefix must be 3 characters or less!');
        }
    } else {
        utils.invalidArgsMsg(message, 'prefix');
    }
}

module.exports = prefix;
