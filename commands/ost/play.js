const utils = require(__basedir + '/utils/utils');
const soundtrack = require(__basedir + '/assets/soundtrack.json');
const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');

let play = async function(message, args) {
    const id = message.guild.id;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;

    if (!message.member.voice.channel) {
        channel.send('You must be in a voice channel to use `play`');
        return;
    }

    if (!task.name) {
        voiceTasks.createMusicTask(task);
    } else if (task.name != voiceTasks.TASK.OST) {
        channel.send('Voice chat already in use!');
        return;
    }

    if (args.length == 0) {
        utils.invalidArgsMsg(message, 'play');
        return;
    }

    let songNum = args[0] - 1;
    if (isNaN(args[0]) || (songNum < 0 || songNum > soundtrack.length - 1)) {
        channel.send('Invalid OST number!');
        return;
    }

    let song = soundtrack[songNum];
    let queueLength = task.queue.length;
    if (queueLength + 1 > 30) {
        channel.send('The queue is maxed-out at 30! Calm your Dokis!');
        return;
    }

    if (queueLength > 0) {
        channel.send('Adding `' + song.name + '` to the queue!');
        task.queue.push(song); 
    } else {
        voice.getConnection(message)
            .then(conn => {
                channel.send('Now playing `' + song.name + '`');
                task.queue.push(song);
                voice.playMusic(message, server, conn);
            });
    }
};

module.exports = play;