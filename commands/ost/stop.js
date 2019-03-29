const ostUtils = require(__basedir + '/utils/audio/ost-utils');

let stop = function(message, args) {
    let id = message.guild.id;
    let channel = message.channel;

	if (!message.member.voice.channel) {
        message.channel.send('You must be in a voice channel to use `stop`');
        return;
    }

    ostUtils.runVoiceCmd(id, channel, async (server, task) => {
        if (!task.dispatcher) {
            channel.send('Nothing to stop!');
            return;
        }

        channel.send(':stop_button: Stopping playback...');
        task.queue = [];
        task.dispatcher.end();
    });
};

module.exports = stop;