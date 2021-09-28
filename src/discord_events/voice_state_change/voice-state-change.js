const voiceManager = require(__basedir + "/voice/voice-manager.js");

let on_voice_state_change = function(client, oldState, newState) {
  // Leaves voice
  if (newState.channelID == null) {
    voiceManager.removeServer(oldState.guild.id);
  }
}

module.exports = on_voice_state_change;