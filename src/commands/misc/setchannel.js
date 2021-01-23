const db = require(__basedir + '/database/db.js');
const utils = require(__basedir + '/utils.js');

let setchannel = function(guild, message, args) {
    const client = message.client;
    const channel = message.channel;

    if (!message.member.hasPermission('MANAGE_GUILD')) {
        channel.send('You need the **Manage Server** permission to use this command!');
        return;
    }

    if (args.length == 0) {
        utils.invalidArgsMsg(message, 'setchannel');
        return;
    }

    args = args.join(' ');

    let newChannel = message.guild.channels.cache.find((channel) => channel.id === utils.stripToNums(args));
    if (!newChannel) {
        newChannel = message.guild.channels.cache.find((channel) => channel.name === args);
    }

    if (newChannel) {
        db.guild.setDefaultChannel(message.guild.id, newChannel.id);
        channel.send('Default channel changed to <#' + newChannel.id + '>');
        if (!newChannel.permissionsFor(client.user).has('SEND_MESSAGES')
                || !newChannel.permissionsFor(client.user).has('VIEW_CHANNEL')) {
            channel.send('But I am still missing perms to:\n'
                    + (!newChannel.permissionsFor(client.user).has('SEND_MESSAGES') ? '-**Send Messages**\n' : '')
                    + (!newChannel.permissionsFor(client.user).has('VIEW_CHANNEL') ? '-**Read Messages**' : ''));
        }
    } else {
        channel.send('Hmmm... I can\'t find that channel. Make sure I have perms to see it!');
    }
};

module.exports = setchannel;