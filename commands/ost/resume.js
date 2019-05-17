const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');

let resume = function(message, args) {
    const id = message.guild.id;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;

    if (!message.member.voice.channel) {
        message.channel.send('You must be in a voice channel to use `resume`');
        return;
    }

    if (task.dispatcher && task.name == voiceTasks.TASK.OST) {
        if (!task.dispatcher.paused) {
            channel.send('Can\'t resume because playback isn\'t paused!');
            return;
        }

        channel.send(':arrow_forward: Resuming...');
        task.dispatcher.resume();
    } else {
        channel.send('Nothing to resume!');
    }
};

module.exports = resume;