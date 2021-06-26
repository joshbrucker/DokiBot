const yts = require('youtube-search');

const utils = require(__basedir + '/utils.js');
const voiceTasks = require(__basedir + '/voice/voice-tasks.js');
const voiceManager = require(__basedir + '/voice/voice-manager.js');

const auth = require(__basedir + '/auth.json');

let play = async function(guild, message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);

  const NOT_IN_VOICE_MSG = 'You must be in a voice channel to use `play`';
  const NO_VIDEO_FOUND_MSG = 'Could not find that video on YouTube!';
  const ALREADY_IN_USE_MSG = 'Voice chat already in use!';
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
    // TODO: Change messages
    utils.invalidArgsMsg(message, 'play');
    return;
  }

  let userSearch = args.join(' ');
  let opts = {
    maxResults: 5,
    key: auth['googleApiKey']
  }
  let results = (await yts(userSearch, opts))['results'];
  let video = results[0];

  if (!video) {
    channel.send(NO_VIDEO_FOUND_MSG);
    return;
  }

  let queueLength = task.queue.length;
  if (queueLength + 1 > 30) {
    channel.send(MAX_QUEUE_MSG);
    return;
  }

  if (queueLength > 0) {
    channel.send('Adding `' + video.title + '` to the queue!');
    voiceManager.addSong(server, video);
  } else {
    voiceManager.getConnection(message)
      .then(conn => {
        channel.send('Now playing `' + video.title + '`');
        voiceManager.addSong(server, video);
        voiceManager.playMusic(conn, server);
      });
  }
};

module.exports = play;