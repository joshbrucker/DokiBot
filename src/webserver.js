const express = require("express");
const Topgg = require("@top-gg/sdk");

const auth = require("./auth.json");
const settings = require("./settings.json");
const GlobalMemberAccessor = require("./database/accessors/GlobalMemberAccessor.js");

function startWebserver() {
  const app = express();

  if (settings.webserver.enableTopggWebhook) {
    startTopggWebhook(app);
  }
}

function startTopggWebhook(app) {
  const webhook = new Topgg.Webhook(auth.topggWebhookAuth);

  app.post(
    "/dblwebhook",
    webhook.listener(async (vote) => {
      // Reset insult submit cooldown
      const globalMemberData = await GlobalMemberAccessor.get(vote.user);
      await globalMemberData.updateNextSubmitDate(new Date());
    })
  );

  const port = settings.webserver.topggWebhookPort;
  app.listen(port, () => {
    console.log(`Started Top.gg webhook at /dblwebhook on port ${port}`);
  });
}

module.exports = startWebserver;