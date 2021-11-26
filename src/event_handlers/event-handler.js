const on_client_ready = require("./client_ready/client-ready");
const on_guild_create = require("./guild_create/guild-create");
const on_interaction_create = require("./interaction_create/interaction-create");
const on_guild_delete = require("./guild_delete/guild-delete");
const on_message = require("./message/message");
const on_message_react_add = require("./message_react_add/message-react-add");
const on_message_react_remove = require("./message_react_remove/message-react-remove");

module.exports = {
	on_client_ready,
	on_guild_create,
	on_guild_delete,
	on_interaction_create,
	on_message_react_add,
	on_message_react_remove,
	on_message,
}