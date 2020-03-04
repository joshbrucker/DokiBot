const utils = require(__basedir + '/utils/utils');
const soundtrack = require(__basedir + '/assets/soundtrack.json');
const voiceTasks = require(__basedir + '/helpers/voice/voice-tasks');
const voiceManager = require(__basedir + '/helpers/voice/voice-manager');

let play = async function(message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);

  const NOT_IN_VOICE_MSG = 'You must be in a voice channel to use `play`';
  const ALREADY_IN_USE_MSG = 'Voice chat already in use!';
  const INVALID_OST_NUM_MSG = 'Invalid OST number!';
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

  if (args.length == 0) {
    utils.invalidArgsMsg(message, 'play');
    return;
  }

  let songNum = args[0] - 1;
  if (isNaN(args[0]) || (songNum < 0 || songNum > soundtrack.length - 1)) {
    channel.send(INVALID_OST_NUM_MSG);
    if (task.queue.length == 0) {
      server.task = null;
    }
    return;
  }

  let song = soundtrack[songNum];
  let queueLength = task.queue.length;
  if (queueLength + 1 > 30) {
    channel.send(MAX_QUEUE_MSG);
    return;
  }

  if (queueLength > 0) {
    channel.send('Adding `' + song.name + '` to the queue!');
    voiceManager.addSong(server, song);
  } else {
    voiceManager.getConnection(message)
      .then(conn => {
        channel.send('Now playing `' + song.name + '`');
        voiceManager.addSong(server, song);
        voiceManager.playMusic(conn, server);
      });
  }
};

module.exports = play;