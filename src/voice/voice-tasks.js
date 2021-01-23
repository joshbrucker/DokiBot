class MusicTask {
  constructor() {
    this.dispatcher = null;
    this.paused = false;
    this.queue = [];
  }
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