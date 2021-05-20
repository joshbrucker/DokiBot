const ytdl = require('ytdl-core');
const voiceTasks = require('./voice-tasks');

const LEAVE_TIME = 300000;
const servers = {};

let getServers = function() {
  return servers;
};

let addServer = function(id) {
  servers[id] = {
    task: null,
    timeout: null,
    id: id
  };
};

let getServer = function(id) {
  if (!servers[id]) {
    addServer(id);
  }
  return servers[id];
};

let removeServer = function(id) {
  if (servers[id]) {
    delete servers[id];
  }
};

let removeTimeout = function(server) {
  clearTimeout(server.timeout);
  server.timeout = null;
};

let createTimeout = function(conn, server) {
  return setTimeout(() => {
      removeServer(server.id);
      conn.disconnect();
    }, LEAVE_TIME);
};

let addSong = function(server, song) {
  server.task.queue.push(song);
};

let getConnection = function(message) {
  const NO_PERMS_ERROR = 'Error [VOICE_JOIN_CHANNEL]: You do not have permission to join this voice channel.';
  const NO_PERMS_MSG = 'I don\'t have access to your voice channel! :frowning:';

  return new Promise((resolve, reject) => {
    const channel = message.channel
    if (!message.guild.voiceConnection) {
      message.member.voice.channel.join()
        .then(conn => {
          resolve(conn);
        })
        .catch(err => {
          if (err.toString() == NO_PERMS_ERROR) {
            channel.send(NO_PERMS_MSG);
          } else {
            reject();
          }
        });
    } else {
      resolve(message.guild.voiceConnection);
    }
  });
}

let playMusic = async function(conn, server) {
  const task = server.task;

  task.dispatcher = conn.play(ytdl(task.queue[0].url, { filter: 'audioonly' }));

  task.dispatcher.once('start', () => {
    conn.player.streamingData.pausedTime = 0;
    if (server.timeout) {
      removeTimeout(server);
    }
  });

  task.dispatcher.on('finish', () => {
    task.queue.shift();
    if (task.queue[0]) {
      playMusic(conn, server);
    } else {
      server.task = null;
      server.timeout = createTimeout(conn, server);
    }
  });
};

let playSound = function(conn, server, path) {
  const task = server.task;

  task.dispatcher = conn.play(path);

  task.dispatcher.once('start', () => {
    if (server.timeout) {
      removeTimeout(server);
    }
  });

  task.dispatcher.on('speaking', (isSpeaking) => {
    if (!isSpeaking) {
      server.task = null;
      server.timeout = createTimeout(conn, server);
    }
  });
};

let disconnectAll = function(client) {
  for (const id in servers) {
    if (servers.hasOwnProperty(id)) {
      let vc = client.guilds.resolve(id).voiceConnection;
      if (vc) {
        vc.disconnect();
      }
    }
  }
};

module.exports = {
  LEAVE_TIME,
  getServer,
  addServer,
  removeServer,
  addSong,
  getConnection,
  playMusic,
  playSound,
  disconnectAll
};