const DiscordBotList = require("top.gg");

const auth = require(__basedir + "/auth.json");
const GlobalMemberAccessor = require(__basedir + "/database/accessors/GlobalMemberAccessor.js");


let setupDBL = function(client) {
  if (auth.dbltoken) {
    let port = auth.webhookPort + client.shard.ids[0];

    const dblInstance = new DiscordBotList(auth.dbltoken, { webhookPort: port, webhookAuth: auth.webhookAuth }, client);

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
    console.log("WARNING: Could not connect to DBL. Are the credentials correct?");
  }
};

async function resetCooldowns(vote) {
  let globalMemberData = await GlobalMemberAccessor.get(vote.user);
  await globalMemberData.updateNextSubmitDate(new Date());
};

module.exports = setupDBL;