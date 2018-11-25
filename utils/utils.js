const fs = require('fs');
const path = require('path');

// Outputs a message with the given commands
var invalidArgsMsg = function(message, command) {
    message.channel.send(':x: **' + message.member.displayName + '**, that\'s not a valid use of \`' + command + '\`!\n'
        + 'Use \`' + 'help ' + command + '\` for more info.');
};

var toTitleCase = function(str) {
    str = str.replace(/_/g, " ").replace(/ *\([^)]*\) */g, "").replace(/[\n\r]/, "");
    str = str.replace(/ *\([^)]*\) */g, "");


    return str.replace(
        /\w\S*\W*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
};

var dateFormat = function(date) {
    return (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
};

var timeFormat = function(date) {
    return date.getHours() + ':' + ((date.getMinutes() >= 10) ? ':' : ':0') + date.getMinutes();
};

var getMonthName = function(int) {
    switch(int) {
        case 1:
            return 'January';
        case 2:
            return 'February';
        case 3:
            return 'March';
        case 4:
            return 'April';
        case 5:
            return 'May';
        case 6:
            return 'June';
        case 7:
            return 'July';
        case 8:
            return 'August';
        case 9:
            return 'September';
        case 10:
            return 'October';
        case 11:
            return 'November';
        case 12:
            return 'December';
    }
};

var secondsConverter = function(int) {
    var remaining = int;

    var days = Math.floor(remaining / 86400);
    if (days < 10) {
        days = '0' + days;
    }
    remaining = remaining % 86400;

    var hours = Math.floor(remaining / 3600);
    if (hours < 10) {
        hours = '0' + hours;
    }
    remaining = remaining % 3600;

    var minutes = Math.floor(remaining / 60);
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    remaining = Math.floor(remaining % 60);

    if (remaining < 10) {
        remaining = '0' + remaining;
    }

    return (days + ':' + hours + ':' + minutes + ':' + remaining);
};

var getGeneralChat = function(guild) {
    return guild.channels.find((channel) => channel.name === 'general');
};

var getMostPermissibleChannel = function(client, guild) {

    var channel = guild.channels.array()[0];

    for (let textChannel of guild.channels.array()) {
        if (textChannel.type == 'text') {
            if (channel.type != 'text') {
                channel = textChannel;
            } else if (textChannel.permissionsFor(client.user).bitfield > channel.permissionsFor(client.user).bitfield
                        && textChannel.permissionsFor(client.user).has('SEND_MESSAGES')
                        && textChannel.permissionsFor(client.user).has('VIEW_CHANNEL')) {
                channel = textChannel;
            }
        }
    }

    return channel;
};

var getMembers = function(guild) {
    var members = guild.members.array();
    var humans = [];
    for (let i = 0; i < members.length; i++) {
        if (!members[i].user.bot) {
            humans.push(members[i]);
        }
    }
    return humans;
}

module.exports = {
    invalidArgsMsg,
    toTitleCase,
    getMostPermissibleChannel,
    getMembers,
    getGeneralChat,
    dateFormat,
    timeFormat,
    secondsConverter,
    getMonthName
};
