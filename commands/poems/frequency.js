const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

let frequency = function(guild, message, args) {
    let channel = message.channel;

    if (!message.member.hasPermission('MANAGE_GUILD')) {
        channel.send('You need the **Manage Server** permission to use this command!');
        return;
    }

    let poemChannel = message.guild.channels.cache.find((channel) => channel.name === 'doki-poems');
    
    if (!poemChannel) {
        channel.send('Hey dummy, if you want to use poem commands, you need a `doki-poems` channel!');
        return;
    }

    if (args.length == 1) {
        let freq;
        switch (args[0].toLowerCase()) {
            case 'day':
                freq = 'day';
                channel.send('Interval changed! I\'ll grab the first word of each `day`.');
                break;
            case 'hour':
                freq = 'hour';
                channel.send('Interval changed! I\'ll grab the first word of each `hour`.');
                break;
            case 'min':
            case 'minute':
                freq = 'minute';
                channel.send('Interval changed! I\'ll grab the first word of each `minute`.');
                break;
            default:
                utils.invalidArgsMsg(message, 'frequency');
                return;
        }

        db.guild.setPoemFreq(guild.id, freq);
    } else {
        utils.invalidArgsMsg(message, 'frequency');
    }
};

module.exports = frequency;