const voiceTasks = require(__basedir + '/helpers/voice/voice-tasks');
const voiceManager = require(__basedir + '/helpers/voice/voice-manager');

let resume = function(message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);
  const task = server.task;

  const NOT_IN_VOICE_MSG = 'You must be in a voice channel to use `resume`';
  const NOT_PAUSED_MSG = 'Can\'t resume because playback isn\'t paused!';
  const RESUME_MSG = ':arrow_forward: Resuming...';
  const NOTHING_TO_RESUME_MSG = 'Nothing to resume!';

  if (!message.member.voice.channel) {
    message.channel.send(NOT_IN_VOICE_MSG);
    return;
  }

  if (task instanceof voiceTasks.MusicTask) {
    if (!task.paused) {
      channel.send(NOT_PAUSED_MSG);
      return;
    }
    task.paused = false;
    task.dispatcher.resume();
    channel.send(RESUME_MSG);
  } else {
    channel.send(NOTHING_TO_RESUME_MSG);
  }
};

module.exports = resume;