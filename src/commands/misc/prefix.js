const db = require(__basedir + '/database/db.js');
const utils = require(__basedir + '/utils.js');

var prefix = function(guild, message, args) {
    let channel = message.channel;

    if (!message.member.hasPermission('MANAGE_GUILD')) {
        channel.send('You need the **Manage Server** permission to use this command!');
        return;
    }

    if (args.length == 1) {
        if (args[0].length <= 3) {
            db.guild.setPrefix(message.guild.id, args[0], () => {
                channel.send('Prefix has been updated to `' + args[0] + '`');
            });
        } else {
            channel.send('Prefix must be 3 characters or less!');
        }
    } else {
        utils.invalidArgsMsg(message, 'prefix');
    }
}

module.exports = prefix;