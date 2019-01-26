const ostUtils = require(__basedir + '/utils/audio/ost-utils');

let skip = function(message, args) {
    let id = message.guild.id;
    let channel = message.channel;

	if (!message.member.voiceChannel) {
        message.channel.send('You must be in a voice channel to use `skip`');
        return;
    }

    ostUtils.runVoiceCmd(id, channel, async (server, task) => {
        if (!task.dispatcher) {
            channel.send('Nothing to skip!');
            return;
        }

        channel.send(':fast_forward: Skipping...');

        if (task.queue[1]) {
            let nextSong = task.queue[1].name;
            channel.send('Now playing \`' + nextSong + '\`');
        } else {
            channel.send('End of queue!');
        }

        task.dispatcher.end();
    });
};

module.exports = skip;