const { PagingResponse } = require(__basedir + "/classes/PagingResponse");

let on_message_react_add = async function(client, reaction) {
  await PagingResponse.handleReactEvent(reaction);
}

module.exports = on_message_react_add;