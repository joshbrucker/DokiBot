const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');


let stop = function(message, args) {
    const id = message.guild.id;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;

	if (!message.member.voice.channel) {
        message.channel.send('You must be in a voice channel to use `stop`');
        return;
    }

    if (task.dispatcher && task.name == voiceTasks.TASK.OST) {
        channel.send(':stop_button: Stopping playback...');
        task.queue = [];
        task.dispatcher.end();
    } else {
        channel.send('Nothing to stop!');
    }
};

module.exports = stop;