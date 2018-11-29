const fs = require('fs');
const path = require('path');

const dbGuild = require(__basedir + '/utils/db/dbGuild');
const utils = require(__basedir + '/utils/utils');

var prefix = function(message, args) {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
        return;
    }

    if (args.length == 1) {
        if (args[0].length <= 3) {
            dbGuild.savePrefix(message.guild.id, args[0], () => {
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
