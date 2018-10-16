/*
    The OST command is disbaled temporarily until
    I iron out a bunch of issues with its
    interactions with nep.js
*/

const fs = require('fs');
const path = require('path');
const YTDL = require('ytdl-core');
const soundtrack = require(__basedir + '/assets/soundtrack.json');

const utils = require(__basedir + '/utils/utils');
const voice = require(__basedir + '/utils/voice');

var servers = {};
/*
    server_id = {
        queue,
        dispatcher,
        pauseTimer
    }
*/

var ost = function(message, args) {

    message.channel.send('The OST function is currently down for maintenance.');
    return;

    var id = message.guild.id

    if (args.length < 1) {
        utils.invalidArgsMsg(message, 'ost');
        return;
    }

    if (!message.member.voiceChannel) {
        message.channel.send('You must be in a voice channel to use \`-ost\`');
        return;
    }

    if (!voice[id]) {
        voice[id] = {
            currTask: 'ost',
            timeout: null
        };
    } else {
        if (!voice[id].currTask) {
            voice[id].currTask = 'ost';
        } else if (voice[id].currTask != 'ost') {
            message.channel.send('Voice chat already in use!');
            return;
        }
    }

    // Sets up server queue
    if (servers[id] == null) {
        servers[id] = {
            queue: []
        };
    }

    var server = servers[id];

    var cmd = args[0].toLowerCase();
    args.splice(0, 1);
    switch (cmd) {
        case 'play':
            if (args.length == 1) {
                if (args[0] >= 1 && args[0] <= soundtrack.length) {
                    var song;

                    for (var i  = 0; i < soundtrack.length; i++) {
                        if (i + 1 == args[0]) {
                            song = soundtrack[i];
                        }
                    }

                    if (server.queue.length > 0) {
                        message.channel.send('Adding \`' + song.name + '\` to the queue');
                    } else {
                        message.channel.send('Now playing \`' + song.name + '\`');
                    }

                    server.queue.push(song);

                    if (!message.guild.voiceConnection) {
                        message.member.voiceChannel.join()
                            .then((connection) => {
                                playMusic(message, connection);
                            });
                    } else if (server.queue.length == 0) {
                        playMusic(message, message.guild.voiceConnection);
                    }
                } else {
                    message.channel.send('Invalid number. Use \`ost list\` for a list of all songs.');
                }
            } else {
                message.channel.send('Invalid number. Use \`ost list\` for a list of all songs.');
            }
            break;
        case 'playall':
            for (var i  = 0; i < soundtrack.length; i++) {
                server.queue.push(soundtrack[i]);
            }

            message.channel.send('Adding all OST songs to the queue');

            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join()
                    .then((connection) => {
                        playMusic(message, connection);
                    });
            } else if (server.queue.length == 0) {
                playMusic(message, connection);
            }
            break;
        case 'stop':
            if (server.dispatcher) {
                server.queue = [];
                server.dispatcher.end();
            }
            break;
        case 'pause':
            if (server.dispatcher) {
                 if (!server.dispatcher.paused) {
                     message.channel.send(':pause_button: Pausing...');
                     server.dispatcher.pause();

                     server.pauseTimer = setTimeout(() => {
                        server.dispatcher.end();
                     }, 3000);
                 }
            }
            break;
        case 'resume':
            if (server.dispatcher) {
                if (server.dispatcher.paused) {
                    message.channel.send(':arrow_forward: Resuming...');
                    server.dispatcher.resume();

                    if (server.pauseTimer) {
                        clearTimeout(server.pauseTimer);
                        server.pauseTimer = null;
                    }
                }
            }
            break;
        case 'skip':
            if (server.dispatcher) {
                if (server.queue[1]) {
                    message.channel.send('Skipping... Now playing \`' + server.queue[1].name + '\`');
                } else {
                    message.channel.send('Skipping... End of queue!');
                }
                server.dispatcher.end();
            }
            break;
        case 'queue':

            //TODO: Tidy this up and make it more readable

            const pageLength = 10;
            var maxPage = Math.ceil(server.queue.length / pageLength);
            var msg;

            if (args.length == 1) {
                var page = args[0];

                if (page > maxPage) {
                    message.channel.send('Invalid queue page.');
                } else {
                    msg = '\`\`\`ml\nCurrent Queue (Page ' + page + ' Of ' + maxPage + ')\n';

                    var startIndex = pageLength * (page - 1);

                    var endIndex;
                    if (page == maxPage) {
                        endIndex = server.queue.length % pageLength + (maxPage - 1) * pageLength;
                    } else {
                        endIndex = page * pageLength;
                    }

                    for (var i = startIndex; i < endIndex; i++) {
                        msg += '\n\"' + (i + 1) + '. ' + server.queue[i].name + '\"';
                    }
                    msg += '\`\`\`';
                    message.channel.send(msg);
                }
            } else {
                msg = '\`\`\`ml\nCurrent Queue (Page 1 Of ' + maxPage + ')\n';
                for (var i = 0; (i < pageLength) && (i < server.queue.length); i++) {
                    msg += '\n\"' + (i + 1) + '. ' + server.queue[i].name + '\"';
                }
                msg += '\`\`\`';
                message.channel.send(msg);
            }
            break;
        case 'clear':
            server.queue = [];
            if (server.dispatcher) {
                server.dispatcher.end();
            }
            break;
        case 'list':
            var msg = '\`\`\`ml\nDoki Doki Literature Club OST\n'
            for (var i = 0; i < soundtrack.length; i++) {
                msg += '\n\"" + (i + 1)' + '. ' + soundtrack[i].name + '\"';
            }
            msg += '\`\`\`';
            message.channel.send(msg);
            break;
        default:
            utils.invalidArgsMsg(message, 'ost');
    }
};

var playMusic = function(message, connection) {
    var id = message.guild.id;
    var server = servers[id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0].url, {filter: 'audioonly'}));

    server.dispatcher.on('start', () => {
        if (voice[id].timeout) {
            clearTimeout(voice[id].timeout);
            voice[id].timeout = null;
        }
    });

    server.dispatcher.on('end', () => {
        server.queue.shift();

        if (server.queue[0]) {
            playMusic(message, connection);
        } else {
            server.dispatcher = null;
            voice[id].currTask = null;

            voice[id].timeout = setTimeout(() => {
                delete voice[id];
                delete servers[id];
                connection.disconnect();
            }, 300000);
        }
    });
};

module.exports = ost;
