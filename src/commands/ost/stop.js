const voiceTasks = require(__basedir + '/voice/voice-tasks.js');
const voiceManager = require(__basedir + '/voice/voice-manager.js');

let stop = function(guild, message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);
  const task = server.task;

  const NOT_IN_VOICE_MSG = 'You must be in a voice channel to use `stop`';
  const STOP_MSG = ':stop_button: Stopping playback...';
  const NOTHING_TO_STOP_MSG = 'Nothing to skip!';

  if (!message.member.voice.channel) {
    message.channel.send(NOT_IN_VOICE_MSG);
    return;
  }

  if (task instanceof voiceTasks.MusicTask) {
    channel.send(STOP_MSG);
    task.queue = [];
    task.dispatcher.end();
  } else {
    channel.send(NOTHING_TO_STOP_MSG);
  }
};

module.exports = stop;