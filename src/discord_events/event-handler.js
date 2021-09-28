const on_client_ready = require(__basedir + "/discord_events/client_ready/client-ready.js");
const on_guild_create = require(__basedir + "/discord_events/guild_create/guild-create.js");
const on_guild_delete = require(__basedir + "/discord_events/guild_delete/guild-delete.js");
const on_message = require(__basedir + "/discord_events/message/message.js");
const on_message_react = require(__basedir + "/discord_events/message_react/message-react.js");
const on_voice_state_change = require(__basedir + "/discord_events/voice_state_change/voice-state-change.js");

module.exports = {
	on_client_ready,
	on_guild_create,
	on_guild_delete,
	on_message_react,
	on_message,
	on_voice_state_change
}