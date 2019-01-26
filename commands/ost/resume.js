const ostUtils = require(__basedir + '/utils/audio/ost-utils');

let resume = function(message, args) {
    let id = message.guild.id;
    let channel = message.channel;

    if (!message.member.voiceChannel) {
        message.channel.send('You must be in a voice channel to use `resume`');
        return;
    }

    ostUtils.runVoiceCmd(id, channel, async (server, task) => {
        if (!task.dispatcher) {
            channel.send('Nothing to resume!');
            return;
        }

        if (!task.dispatcher.paused) {
            channel.send('Can\'t resume because playback isn\'t paused!');
            return;
        }

        channel.send(':arrow_forward: Resuming...');
        task.dispatcher.resume();

        clearTimeout(task.pauseTimeout);
        task.pauseTimeout = null;
    });
};

module.exports = resume;