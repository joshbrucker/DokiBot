const soundtrack = require(__basedir + '/assets/soundtrack.json');
const voiceTasks = require(__basedir + '/voice/voice-tasks.js');
const voiceManager = require(__basedir + '/voice/voice-manager.js');

let ostAll = async function(client, guild, message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);

  const NOT_IN_VOICE_MSG = 'You must be in a voice channel to use `playall`';
  const ALREADY_IN_USE_MSG = 'Voice chat already in use!';
  const ADDING_ALL_MSG = 'Adding all OST songs to the queue!';
  const MAX_QUEUE_MSG = 'The queue is maxed-out at 30! Calm your Dokis!';

  if (!message.member.voice.channel) {
    channel.send(NOT_IN_VOICE_MSG);
    return;
  }

  if (!server.task) {
    server.task = new voiceTasks.MusicTask();
  } else if (!(server.task instanceof voiceTasks.MusicTask)) {
    channel.send(ALREADY_IN_USE_MSG);
    return;
  }
  const task = server.task;

  channel.send(ADDING_ALL_MSG);
  let firstQueueLen = task.queue.length;
  for (let i = 0; i < soundtrack.length; i++) {
    if (task.queue.length + 1 <= 30) {
      task.queue.push(soundtrack[i]);
    } else {
      channel.send(MAX_QUEUE_MSG);
      break;
    }
  }

  if (firstQueueLen == 0) {
    voiceManager.getConnection(message)
      .then(conn => {
        voiceManager.playMusic(message, server, conn);
      });
  }
};

module.exports = ostAll;