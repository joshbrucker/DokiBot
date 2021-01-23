const on_client_ready = require(__basedir + '/event_handlers/client_ready/client-ready.js');
const on_guild_create = require(__basedir + '/event_handlers/guild_create/guild-create.js');
const on_guild_delete = require(__basedir + '/event_handlers/guild_delete/guild-delete.js');
const on_message = require(__basedir + '/event_handlers/message/message.js');
const on_message_react = require(__basedir + '/event_handlers/message_react/message-react.js');

module.exports = {
	on_client_ready,
	on_guild_create,
	on_guild_delete,
	on_message_react,
	on_message
}