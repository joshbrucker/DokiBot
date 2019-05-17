const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');

let clear = async function(message, args) {
    const id = message.guild.id;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;

	if (!message.member.voice.channel) {
        channel.send('You must be in a voice channel to use `clear`');
        return;
    }

    if (task.dispatcher && task.name == voiceTasks.TASK.OST) {
        channel.send('Cleared the queue!');
        if (task.queue[0]) {
            task.queue = [task.queue[0]];
        }
    } else {
       channel.send('Nothing to clear!');
    }
};

module.exports = clear;