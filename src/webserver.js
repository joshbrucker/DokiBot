const express = require("express");
const Topgg = require("@top-gg/sdk");

const auth = require("./auth.json");
const settings = require("./settings.json");
const { promClient } = require("./utils/metrics.js");
const GlobalMemberAccessor = require("./database/accessors/GlobalMemberAccessor.js");

function startTopggWebhook() {
  const topggWebhookApp = express();
  const webhook = new Topgg.Webhook(auth.topggWebhookAuth);

  topggWebhookApp.post("/dblwebhook", webhook.listener(async (vote) => {
      // Reset insult submit cooldown
      const globalMemberData = await GlobalMemberAccessor.get(vote.user);
      await globalMemberData.updateNextSubmitDate(new Date());
    })
  );

  const port = settings.webserver.topggWebhookPort;
  topggWebhookApp.listen(port, () => {
    console.log(`Started Top.gg webhook at /dblwebhook on port ${port}`);
  });
}

let prometheusPort = settings.webserver.prometheusWebhookPort;

function startPrometheusMetrics() {
  const prometheusMetricsApp = express();

  prometheusMetricsApp.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  });

  // For sharding, we need to keep incrementing the port.
  const port = prometheusPort++;
  prometheusMetricsApp.listen(port, () => {
    console.log(`Prometheus metrics running on port ${port}`);
  });
}

module.exports = { startTopggWebhook, startPrometheusMetrics };