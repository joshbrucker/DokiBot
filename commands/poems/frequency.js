const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

let frequency = function(guild, message, args) {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
        return;
    }

    let poemChannel = message.guild.channels.find((channel) => channel.name === 'doki-poems');
    
    if (!poemChannel) {
        message.channel.send('Hey dummy, if you want to use poem commands, you need a `doki-poems` channel!');
        return;
    }

    if (args.length == 1) {
        let freq;
        switch (args[0].toLowerCase()) {
            case 'day':
                freq = 'day';
                message.channel.send('Interval changed! I\'ll grab the first word of each `day`.');
                break;
            case 'hour':
                freq = 'hour';
                message.channel.send('Interval changed! I\'ll grab the first word of each `hour`.');
                break;
            case 'min':
            case 'minute':
                freq = 'minute';
                message.channel.send('Interval changed! I\'ll grab the first word of each `minute`.');
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