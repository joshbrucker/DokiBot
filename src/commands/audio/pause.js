const voiceTasks = require(__basedir + "/voice/voice-tasks.js");
const voiceManager = require(__basedir + "/voice/voice-manager.js");

let pause = function(client, guild, message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);
  const task = server.task;

  const NOT_IN_VOICE_MSG = "You  must be in a voice channel to use `pause`";
  const ALREADY_PAUSED_MSG = "Playback is already paused!";
  const PAUSE_MSG = ":pause_button: Pausing...";
  const NOTHING_TO_PAUSE_MSG = "Nothing to pause!";

  if (!message.member.voice.channel) {
    channel.send(NOT_IN_VOICE_MSG);
    return;
  }

  if (task instanceof voiceTasks.MusicTask) {
    if (task.paused) {
      channel.send(ALREADY_PAUSED_MSG);
      return;
    }
    task.paused = true;
    task.dispatcher.pause();
    channel.send(PAUSE_MSG);
  } else {
    channel.send(NOTHING_TO_PAUSE_MSG);
  }
};

module.exports = pause;