const DiscordBotList = require("dblapi.js");
const db = require(__basedir + "/database/db.js");

let setupDBL = function(auth, client) {
  let DBL_TOKEN = auth.dbltoken;
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
    console.log("WARNING: Could not successfully connect to DBL. Are the credentials correct?");
  }
};

let resetCooldowns = function(vote) {
  const ID = vote.user;
  const DATE = new Date();

  db.member.getMember(ID, (member) => {
    member = member[0];
    if (member.submit_cooldown == null || member.submit_cooldown <= date) {
      return;
    }
    db.member.setSubmitCooldown(ID, null);
  });
};

module.exports = setupDBL;