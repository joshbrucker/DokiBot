const DiscordBotList = require("dblapi.js");
const resetCooldowns = require("./reset-cooldowns");

const DBL_ERROR_MSG = "WARNING: Could not successfully connect to DBL. Are the credentials correct?";

let setupDbl = function(auth, client) {
  DBL_TOKEN = auth.dbltoken;
  if (DBL_TOKEN) {
    let port = auth.webhookPort + client.shard.ids[0];

    const dblInstance = new DiscordBotList(DBL_TOKEN, { webhookPort: port,
    	webhookAuth: auth.webhookAuth }, client);

    dblInstance.webhook.on("ready", (hook) => {
      console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
    });

    dblInstance.webhook.on("vote", (vote) => {
      resetCooldowns(vote);
    });

    dblInstance.on("error", (err) => {
      console.log(err);
    });
  } else {
    console.log(DBL_ERROR_MSG);
  }
};

module.exports = setupDbl;