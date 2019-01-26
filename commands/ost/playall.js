const ostUtils = require(__basedir + '/utils/audio/ost-utils');
const soundtrack = require(__basedir + '/assets/soundtrack.json');

let playall = async function(message, args) {
    let id = message.guild.id;
    let channel = message.channel;

	if (!message.member.voiceChannel) {
        message.channel.send('You must be in a voice channel to use `playall`');
        return;
    }

    ostUtils.runVoiceCmd(id, channel, async (server, task) => {
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
                try {
                    var conn = await message.member.voiceChannel.join();
                    ostUtils.playMusic(message, conn);
                } catch(err) {
                    if (err.toString() == 'Error: You do not have permission to join this voice channel.') {
                        channel.send('I don\'t have access to your voice channel! :frowning:');
                    } else {
                        throw new Error(err);
                    }
                }
            } else {
                ostUtils.playMusic(message, message.guild.voiceConnection);
            }
        }
    });
};

module.exports = playall;