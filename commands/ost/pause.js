const ostUtils = require(__basedir + '/utils/audio/ost-utils');

let pause = function(message, args) {
    let id = message.guild.id;
    let channel = message.channel;

    if (!message.member.voice.channel) {
        message.channel.send('You must be in a voice channel to use `pause`');
        return;
    }

    ostUtils.runVoiceCmd(id, channel, async (server, task) => {
        if (!task.dispatcher) {
            channel.send('Nothing to pause!');
            return;
        }

        if (task.dispatcher.paused) {
            channel.send('Playback is already paused!');
            return;
        }

        channel.send(':pause_button: Pausing...');
        task.dispatcher.pause();

        task.pauseTimeout = setTimeout(() => {
            channel.send('Pause timed out, moving on to next song!');
            task.pauseTimeout = null;
            task.dispatcher.end();
        }, 300000);
    });
};

module.exports = pause;