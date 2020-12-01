const voiceManager = require(__basedir + '/helpers/voice/voice-manager');
const voiceTasks = require(__basedir + '/helpers/voice/voice-tasks');

let clear = async function(message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);
  const task = server.task;

  const NOT_IN_VOICE_MSG = 'You  must be in a voice channel to use `clear`';
  const CLEAR_MSG = 'Cleared the queue!';
  const EMPTY_QUEUE_MSG = 'Nothing to clear!';

  if (!message.member.voice.channel) {
    channel.send(NOT_IN_VOICE_MSG);
    return;
  }

  if (task instanceof voiceTasks.MusicTask) {
    channel.send(CLEAR_MSG);
    if (task.queue[0]) {
      task.queue = [task.queue[0]];
    }
  } else {
     channel.send(EMPTY_QUEUE_MSG);
  }
};

module.exports = clear;