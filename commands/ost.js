const fs = require('fs');
const path = require('path');
const YTDL = require('ytdl-core');
const soundtrack = require(__basedir + '/assets/soundtrack.json');

const utils = require(__basedir + '/utils/utils');
const voice = require(__basedir + '/utils/voice');

var ost = function(message, args) {

    var id = message.guild.id
    var channel = message.channel;

    if (args.length < 1) {
        utils.invalidArgsMsg(message, 'ost');
        return;
    }

    // List does not use voice chat and should be run apart from the others
    if (args[0] == 'list') {
	    var msg = '```ml\nDoki Doki Literature Club OST\n';
        for (var i = 0; i < soundtrack.length; i++) {
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

    // Sets up serverwide voice chat management
    if (!voice.servers[id]) {
        voice.servers[id] = {
            task: {
            	name: null,
            	dispatcher: null
            },
            timeout: null
        };
    }

    const server = voice.servers[id];
    const task = server.task;

    if (task.name && task.name != 'ost') {
        channel.send('Voice chat already in use through the `' + task.name + '` command!');
        return;
    } else {
    	if (task.queue == undefined) {
    		task.queue = [];
    	}
    	if (task.pauseTimeout == undefined) {
    		task.pauseTimeout = null;
    	}
    }

    var cmd = args[0].toLowerCase();
    args.splice(0, 1);

    switch (cmd) {
        case 'play':
            if (args.length == 1) {
            	var songNum = args[0] - 1;
                if (songNum >= 0 && songNum < soundtrack.length) {
                    var song = soundtrack[songNum];
                    var queueLength = task.queue.length;

                    if (queueLength + 1 <= 30) {
	                    task.queue.push(song);

	                    if (queueLength > 0) {
	                        channel.send('Adding `' + song.name + '` to the queue!');
	                    } else {
	                    	channel.send('Now playing `' + song.name + '`');
	                    	if (!message.guild.voiceConnection) {
		                        message.member.voiceChannel.join()
		                            .then((connection) => {
		                                playMusic(message, connection);
		                            });
		                    } else {
		                        playMusic(message, message.guild.voiceConnection);
		                    }
	                    }
                    } else {
                    	channel.send('The queue is maxed-out at 30! Calm down!');
                    }
                } else {
                    channel.send('Invalid OST number. Use `ost list` for a list of all songs.');
                }
            } else {
                channel.send('Invalid usage. Use \`help ost\` to see proper usage.');
            }
            break;
        case 'playall':
            channel.send('Adding all OST songs to the queue!');

        	var queueLength = task.queue.length;

            for (var i = 0; i < soundtrack.length; i++) {
            	if (task.queue.length + 1 <= 30) {
                	task.queue.push(soundtrack[i]);
            	} else {
                    channel.send('The queue is maxed-out at 30! Calm down!');
                    break;
            	}
            }

            if (queueLength == 0) {
	            if (!message.guild.voiceConnection) {
	                message.member.voiceChannel.join()
	                    .then((connection) => {
	                        playMusic(message, connection);
	                    });
	            } else {
	                playMusic(message, message.guild.voiceConnection);
	            }
            }
            break;
        case 'stop':
            if (task.dispatcher) {
            	channel.send(':stop_button: Stopping playback...');
                task.queue = [];
                task.dispatcher.end();
            } else {
            	channel.send('Nothing to stop!');
            }
            break;
            
        // Pause & Resume cause strange audio lag -> temporarily disabled.
        case 'pause':
        	channel.send('The pause feature is temporarily disabled.');
            // if (task.dispatcher) {
            //      if (!task.dispatcher.paused) {
            //          channel.send(':pause_button: Pausing...');
            //          task.dispatcher.pause();

            //          task.pauseTimeout = setTimeout(() => {
            //             channel.send('Pause timed out, moving to next song!');
            //             task.pauseTimeout = null;
            //             task.dispatcher.end();
            //          }, 5000);
            //          return;
            //      } else {
            //      	channel.send('Playback is already paused!');
            //      }
            // } else {
            // 	channel.send('Nothing to pause!');
            // }
            break;
        case 'resume':
        	channel.send('The resume feature is temporarily disabled.');
            // if (task.dispatcher) {
            //     if (task.dispatcher.paused) {
            //         channel.send(':arrow_forward: Resuming...');
            //         task.dispatcher.resume();

            //         clearTimeout(task.pauseTimeout);
            //         task.pauseTimeout = null;
            //         return;
            //     } else {
            //     	channel.send('Can\'t resume because playback isn\'t paused!');
            //     }
            // } else {
            // 	channel.send('Nothing to resume!');
            // }
            break;
        case 'skip':
            if (task.dispatcher) {
                if (task.queue[1]) {
                    channel.send(':fast_forward: Skipping...');
                    channel.send('Now playing \`' + task.queue[1].name + '\`');
                } else {
                    channel.send(':fast_forward: Skipping...');
                    channel.send('End of queue!');
                }
                task.dispatcher.end();
            } else {
            	channel.send('Nothing to skip!');
            }
            break;
        case 'queue':

            //TODO: Tidy this up and make it more readable

            const pageLength = 10;
            var maxPage = Math.ceil(task.queue.length / pageLength);
            var msg;

            if (args.length == 1) {
                var page = args[0];

                if (page > maxPage) {
                    channel.send('Invalid queue page.');
                } else {
                    msg = '\`\`\`ml\nCurrent Queue (Page ' + page + ' Of ' + maxPage + ')\n';

                    var startIndex = pageLength * (page - 1);

                    var endIndex;
                    if (page == maxPage && task.queue.length % pageLength != 0) {
                        endIndex = task.queue.length % pageLength + (maxPage - 1) * pageLength;
                    } else {
                        endIndex = page * pageLength;
                    }

                    for (var i = startIndex; i < endIndex; i++) {
                        msg += '\n\"' + (i + 1) + '. ' + task.queue[i].name + '\"';
                    }
                    msg += '\`\`\`';
                    channel.send(msg);
                }
            } else {
                msg = '\`\`\`ml\nCurrent Queue (Page 1 Of ' + maxPage + ')\n';
                for (var i = 0; (i < pageLength) && (i < task.queue.length); i++) {
                    msg += '\n\"' + (i + 1) + '. ' + task.queue[i].name + '\"';
                }
                msg += '\`\`\`';
                channel.send(msg);
            }
            break;
        case 'clear':
        	if (task.dispatcher) {
        		channel.send('Cleared the queue!');
        		task.queue = [task.queue[0]];
        	} else {
        		channel.send('Nothing to clear!');
        	}
            break;
        default:
            utils.invalidArgsMsg(message, 'ost');
    }
};

var playMusic = function(message, connection) {
    var id = message.guild.id;
    const server = voice.servers[id];
    const task = server.task;

    task.name = 'ost';

    task.dispatcher = connection.playStream(YTDL(task.queue[0].url, {filter: 'audioonly'}));

    task.dispatcher.once('start', () => {
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
            server.task = {
            	name: null,
            	dispatcher: null
            };

            server.timeout = setTimeout(() => {
                delete voice.servers[id];
                connection.disconnect();
            }, voice.leaveTime);
        }
    });
};

module.exports = ost;
