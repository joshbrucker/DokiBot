const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');

let pause = function(message, args) {
    const id = message.guild.id;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;

    if (!message.member.voice.channel) {
        message.channel.send('You must be in a voice channel to use `pause`');
        return;
    }

    if (task.dispatcher && task.name == voiceTasks.TASK.OST) {
        if (task.dispatcher.paused) {
            channel.send('Playback is already paused!');
            return;
        }

        channel.send(':pause_button: Pausing...');
        task.dispatcher.pause();
    } else {
        channel.send('Nothing to pause!');
    }
};

module.exports = pause;