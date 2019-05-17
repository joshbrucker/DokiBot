const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');


let skip = function(message, args) {
    const id = message.guild.id;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;

	if (!message.member.voice.channel) {
        message.channel.send('You must be in a voice channel to use `skip`');
        return;
    }

    if (task.dispatcher && task.name == voiceTasks.TASK.OST) {
        channel.send(':fast_forward: Skipping...');

        if (task.queue[1]) {
            let nextSong = task.queue[1].name;
            channel.send('Now playing \`' + nextSong + '\`');
        } else {
            channel.send('End of queue!');
        }

        task.dispatcher.end();
    } else {
        channel.send('Nothing to skip!');
    }
};

module.exports = skip;