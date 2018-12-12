const fs = require('fs');
const path = require('path');
const YTDL = require('ytdl-core');
const soundtrack = require(__basedir + '/assets/soundtrack.json');

const utils = require(__basedir + '/utils/utils');
const voice = require(__basedir + '/utils/voice');

let ost = function(message, args) {

    const id = message.guild.id
    const channel = message.channel;

    if (args.length < 1) {
        utils.invalidArgsMsg(message, 'ost');
        return;
    }

    // List does not use voice chat and should be run apart from the others
    if (args[0] == 'list') {
        let msg = '```ml\nDoki Doki Literature Club OST\n';
        for (let i = 0; i < soundtrack.length; i++) {
            msg += '\n\"' + (i + 1) + '. ' + soundtrack[i].name + '\"';
        }
        msg += '\`\`\`';
        channel.send(msg);
        return;
    }

    if (!message.member.voiceChannel) {
        message.channel.send('You must be in a voice channel to use `ost`');
        return;
    }

    // Voice setup
    if (!voice.getServer(id)) {
        voice.addServer(id);
    }

    const server = voice.getServer(id);
    const task = server.task;

    if (!task.name) {
        createTask(task);
    }

    if (task.name != voice.TASK.OST) {
        channel.send('Voice chat already in use!');
        return;
    }

    let cmd = args[0].toLowerCase();
    args.splice(0, 1);

    switch (cmd) {
        case 'play':
            if (args.length != 1) {
                utils.invalidArgsMsg(message, 'ost');
                return;
            }

            let songNum = args[0] - 1;

            if (songNum < 0 || songNum > soundtrack.length) {
                channel.send('Invalid OST number!');
                return;
            }

            let song = soundtrack[songNum];
            let queueLength = task.queue.length;

            if (queueLength + 1 > 30) {
                channel.send('The queue is maxed-out at 30! Calm down!');
                return
            }

            if (queueLength > 0) {
                channel.send('Adding `' + song.name + '` to the queue!');
                task.queue.push(song); 
            } else {
                if (message.guild.voiceConnection) {
                    channel.send('Now playing `' + song.name + '`');
                    task.queue.push(song);
                    playMusic(message, message.guild.voiceConnection);
                } else {
                    message.member.voiceChannel.join()
                        .then((connection) => {
                            channel.send('Now playing `' + song.name + '`');
                            task.queue.push(song);
                            playMusic(message, connection);
                        })
                        .catch((err) => {
                            if (err.toString() == 'Error: You do not have permission to join this voice channel.') {
                                channel.send('I don\'t have access to your voice channel! :frowning:');
                                voice.removeServer(id);
                            } else {
                                throw err;
                            }
                        });
                }
            }
            break;
        case 'playall':
            channel.send('Adding all OST songs to the queue!');

            let initialQueue = task.queue.length;

            for (let i = 0; i < soundtrack.length; i++) {
                if (task.queue.length + 1 <= 30) {
                    task.queue.push(soundtrack[i]);
                } else {
                    channel.send('The queue is maxed-out at 30! Calm down!');
                    break;
                }
            }

            if (initialQueue == 0) {
                if (!message.guild.voiceConnection) {
                    message.member.voiceChannel.join()
                        .then((connection) => {
                            playMusic(message, connection);
                        })
                        .catch((err) => {
                            if (err.toString() == "Error: You do not have permission to join this voice channel.") {
                                channel.send("I don't have access to your voice channel! :frowning:");
                                voice.removeServer(id);
                            } else {
                                throw err;
                            }
                        });
                } else {
                    playMusic(message, message.guild.voiceConnection);
                }
            }
            break;
        case 'stop':
            if (!task.dispatcher) {
                channel.send('Nothing to stop!');
                return;
            }

            channel.send(':stop_button: Stopping playback...');
            task.queue = [];
            task.dispatcher.end();
            break;
        case 'pause':
            if (!task.dispatcher) {
                channel.send('Nothing to pause!');
                return;
            }

            if (task.dispatcher.paused) {
                channel.send('Playback is already paused!');
                return;
            }

            channel.send(':pause_button: Pausing...');
            task.dispatcher.pause();

            task.pauseTimeout = setTimeout(() => {
                channel.send('Pause timed out, moving to next song!');
                task.pauseTimeout = null;
                task.dispatcher.end();
            }, 300000);
            break;
        case 'resume':
            if (!task.dispatcher) {
                channel.send('Nothing to resume!');
                return;
            }

            if (!task.dispatcher.paused) {
                channel.send('Can\'t resume because playback isn\'t paused!');
                return;
            }

            channel.send(':arrow_forward: Resuming...');
            task.dispatcher.resume();

            clearTimeout(task.pauseTimeout);
            task.pauseTimeout = null;
            break;
        case 'skip':
            if (!task.dispatcher) {
                channel.send('Nothing to skip!');
                return;
            }

            if (task.queue[1]) {
                let nextSong = task.queue[1].name;
                channel.send(':fast_forward: Skipping...');
                channel.send('Now playing \`' + nextSong + '\`');
                task.dispatcher.end();
            } else {
                channel.send(':fast_forward: Skipping...');
                channel.send('End of queue!');
                task.dispatcher.end();
            }
            break;
        case 'queue':

            //TODO: Tidy this up and make it more readable

            const pageLength = 10;
            let maxPage = Math.ceil(task.queue.length / pageLength);
            let msg;

            if (args.length == 1) {
                let page = args[0];

                if (page > maxPage) {
                    channel.send('Invalid queue page.');
                } else {
                    msg = '\`\`\`ml\nCurrent Queue (Page ' + page + ' Of ' + maxPage + ')\n';

                    let startIndex = pageLength * (page - 1);

                    let endIndex;
                    if (page == maxPage && task.queue.length % pageLength != 0) {
                        endIndex = task.queue.length % pageLength + (maxPage - 1) * pageLength;
                    } else {
                        endIndex = page * pageLength;
                    }

                    for (let i = startIndex; i < endIndex; i++) {
                        msg += '\n\"' + (i + 1) + '. ' + task.queue[i].name + '\"';
                    }
                    msg += '\`\`\`';
                    channel.send(msg);
                }
            } else {
                msg = '\`\`\`ml\nCurrent Queue (Page 1 Of ' + maxPage + ')\n';
                for (let i = 0; (i < pageLength) && (i < task.queue.length); i++) {
                    msg += '\n\"' + (i + 1) + '. ' + task.queue[i].name + '\"';
                }
                msg += '\`\`\`';
                channel.send(msg);
            }
            break;
        case 'clear':
            if (!task.dispatcher) {
                channel.send('Nothing to clear!');
                return;
            }

            channel.send('Cleared the queue!');
            if (task.queue[0]) {
                task.queue = [task.queue[0]];
            }
            break;
        default:
            utils.invalidArgsMsg(message, 'ost');
    }
};

let playMusic = function(message, connection) {
    const id = message.guild.id;

    const server = voice.getServer(id);
    const task = server.task;

    task.dispatcher = connection.playStream(YTDL(task.queue[0].url, {filter: 'audioonly'}));

    task.dispatcher.once('start', () => {
        connection.player.streamingData.pausedTime = 0;
        if (server.timeout) {
            clearTimeout(server.timeout);
            server.timeout = null;
        }
    });

    task.dispatcher.once('end', () => {
        task.queue.shift();

        if (task.queue[0]) {
            playMusic(message, connection);
        } else {
            voice.resetTask(id);

            server.timeout = setTimeout(() => {
                voice.removeServer(id);
                connection.disconnect();
            }, voice.leaveTime);
        }
    });
};

let createTask = function(task) {
    task.name = voice.TASK.OST;
    if (task.queue == undefined) {
        task.queue = [];
    }
    if (task.pauseTimeout == undefined) {
        task.pauseTimeout = null;
    }
};

module.exports = ost;
