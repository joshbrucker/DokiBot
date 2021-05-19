const fs = require('fs');
const path = require('path');

const voiceTasks = require(__basedir + '/voice/voice-tasks.js');
const voiceManager = require(__basedir + '/voice/voice-manager.js');

let nep = function(guild, message, args) {
  const id = message.guild.id;
  const client = message.client;
  const channel = message.channel;
  const server = voiceManager.getServer(id);

  const NOT_IN_VOICE_MSG = 'You must be in a voice channel to use `nep`';
  const ALREADY_IN_USE_MSG = 'Voice chat already in use!';
  const NEP_EMOJI_ID = '522202578818301970';

  if (!message.member.voice.channel) {
    message.channel.send(NOT_IN_VOICE_MSG);
    return;
  }

  if (!server.task) {
    server.task = new voiceTasks.SoundTask();
  } else {
    channel.send(ALREADY_IN_USE_MSG);
    return;
  }
  const task = server.task;

  let path = __basedir + '/assets/nep_audio/';
  let character;
  if (args.length == 0) {
    folders = fs.readdirSync(path);
    character = folders[Math.floor(Math.random() * folders.length)];
  } else {
    character = args[0];
  }

  path += character;
  fs.readdir(path, (err, files) => {
    if (err) {
      channel.send('Can\'t find character ' + character + '!');
      server.task = null;
    } else {
      let random = Math.floor(Math.random() * files.length);
      path += '/' + files[random];

      let emoji = client.emojis.resolve(NEP_EMOJI_ID);

      voiceManager.getConnection(message)
        .then(conn => {
          channel.send('Nepu nepu! ' + emoji.toString());
          voiceManager.playSound(conn, server, path);
        });
    }
  });
};

module.exports = nep;