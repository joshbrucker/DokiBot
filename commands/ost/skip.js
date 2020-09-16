const voiceTasks = require(__basedir + '/helpers/voice/voice-tasks');
const voiceManager = require(__basedir + '/helpers/voice/voice-manager');

let skip = function(message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);
  const task = server.task;

  const NOT_IN_VOICE_MSG = 'You must be in a voice channel to use `skip`';
  const SKIP_MSG = ':fast_forward: Skipping...';
  const NOTHING_TO_SKIP_MSG = 'Nothing to skip!';

  if (!message.member.voice.channel) {
    message.channel.send(NOT_IN_VOICE_MSG);
    return;
  }

  if (task instanceof voiceTasks.MusicTask) {
    channel.send(SKIP_MSG);

    if (task.queue[1]) {
      let nextSong = task.queue[1].name;
      channel.send('Now playing \`' + nextSong + '\`');
    }

    task.dispatcher.end();
  } else {
    channel.send(NOTHING_TO_SKIP_MSG);
  }
};

module.exports = skip;