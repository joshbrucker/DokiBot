class MusicTask {
  constructor() {
    this.dispatcher = null;
    this.paused = false;
    this.queue = [];
  }

//   addSong = function(song) {
//     this.queue.push(song);
//   };

//   playMusic = async function(conn, server) {
//     this.dispatcher = conn.play(ytdl(this.queue[0].url, { filter: 'audioonly' }));

//     this.dispatcher.once('start', () => {
//       conn.player.streamingData.pausedTime = 0;
//       if (server.timeout) {
//         removeTimeout(server);
//       }
//     });

//     this.dispatcher.on('finish', () => {
//       this.queue.shift();
//       if (this.queue[0]) {
//         playMusic(conn, server);
//       } else {
//         this.task = null;
//         this.timeout = createTimeout(conn, server);
//       }
//     });
//   };
}

class SoundTask {
  constructor() {
    this.dispatcher = null;
  }
}

module.exports = {
  MusicTask,
  SoundTask
};