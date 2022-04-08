const onClientReady = require("./client_ready/client-ready");
const onGuildCreate = require("./guild_create/guild-create");
const onInteractionCreate = require("./interaction_create/interaction-create");
const onGuildDelete = require("./guild_delete/guild-delete");
const onMessage = require("./message/message");
const onMessageReactAdd = require("./message_react_add/message-react-add");
const onMessageReactRemove = require("./message_react_remove/message-react-remove");

module.exports = {
  onClientReady,
  onGuildCreate,
  onGuildDelete,
  onInteractionCreate,
  onMessageReactAdd,
  onMessageReactRemove,
  onMessage
};