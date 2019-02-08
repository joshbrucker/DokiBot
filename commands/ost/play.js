const utils = require(__basedir + '/utils/utils');
const ostUtils = require(__basedir + '/utils/audio/ost-utils');
const soundtrack = require(__basedir + '/assets/soundtrack.json');

let play = async function(message, args) {
    let id = message.guild.id;
    let channel = message.channel;

    if (!message.member.voiceChannel) {
        message.channel.send('You must be in a voice channel to use `play`');
        return;
    }

    ostUtils.runVoiceCmd(id, channel, async (server, task) => {
        if (args.length == 0) {
            utils.invalidArgsMsg(message, 'play');
        }

        let songNum = args[0] - 1;

        if (isNaN(args[0]) || (songNum < 0 || songNum > soundtrack.length - 1)) {
            channel.send('Invalid OST number!');
            return;
        }

        let song = soundtrack[songNum];
        let queueLength = task.queue.length;

        if (queueLength + 1 > 30) {
            channel.send('The queue is maxed-out at 30! Calm down!');
            return;
        }

        if (queueLength > 0) {
            channel.send('Adding `' + song.name + '` to the queue!');
            task.queue.push(song); 
        } else {
            if (message.guild.voiceConnection) {
                channel.send('Now playing `' + song.name + '`');
                task.queue.push(song);
                ostUtils.playMusic(message, message.guild.voiceConnection);
            } else {
                try {
                    var conn = await message.member.voiceChannel.join();
                    channel.send('Now playing `' + song.name + '`');
                    task.queue.push(song);
                    ostUtils.playMusic(message, conn);
                } catch(err) {
                    if (err.toString() == 'Error: You do not have permission to join this voice channel.') {
                        channel.send('I don\'t have access to your voice channel! :frowning:');
                    } else {
                        throw new Error(err);
                    }
                }
            }
        }
    });
};

module.exports = play;