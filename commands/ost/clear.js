const ostUtils = require(__basedir + '/utils/audio/ost-utils');

let clear = function(message, args) {
    let id = message.guild.id;
    let channel = message.channel;

	if (!message.member.voice.channel) {
        message.channel.send('You must be in a voice channel to use `clear`');
        return;
    }

    ostUtils.runVoiceCmd(id, channel, async (server, task) => {
        if (!task.dispatcher) {
            channel.send('Nothing to clear!');
            return;
        }

        channel.send('Cleared the queue!');
        if (task.queue[0]) {
            task.queue = [task.queue[0]];
        }
    });
};

module.exports = clear;