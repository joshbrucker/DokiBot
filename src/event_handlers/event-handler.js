const on_client_ready = require("./client_ready/client-ready");
const on_guild_create = require("./guild_create/guild-create");
const on_interaction_create = require("./interaction_create/interaction-create");
const on_guild_delete = require("./guild_delete/guild-delete");
const on_message = require("./message/message");
const on_message_react = require("./message_react/message-react");

module.exports = {
	on_client_ready,
	on_guild_create,
	on_guild_delete,
	on_interaction_create,
	on_message_react,
	on_message,
}