const soundtrack = require(__basedir + '/assets/soundtrack.json');
const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');

let playall = async function(message, args) {
    const id = message.guild.id;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;

	if (!message.member.voice.channel) {
        channel.send('You must be in a voice channel to use `playall`');
        return;
    }

    if (!task.name) {
        voiceTasks.createMusicTask(task);
    } else if (task.name != voiceTasks.TASK.OST) {
        channel.send('Voice chat already in use!');
        return;
    }

    channel.send('Adding all OST songs to the queue!');

    let firstQueueLen = task.queue.length;
    for (let i = 0; i < soundtrack.length; i++) {
        if (task.queue.length + 1 <= 30) {
            task.queue.push(soundtrack[i]);
        } else {
            channel.send('The queue is maxed-out at 30! Calm your Dokis!');
            break;
        }
    }

    if (firstQueueLen == 0) {
        voice.getConnection(message)
            .then(conn => {
                voice.playMusic(message, server, conn);
            });
    }
};

module.exports = playall;