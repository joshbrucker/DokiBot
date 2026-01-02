const promClient = require('prom-client');

// Collect default Node.js metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics();

const commandsCounter = new promClient.Counter({
  name: 'discord_commands_total',
  help: 'Total number of Discord commands used',
  labelNames: ['command', 'subcommand'],
});

const insultsSentCounter = new promClient.Counter({
  name: 'dokibot_insults_sent',
  help: 'Total number of insults sent out to guilds',
  labelNames: ['trigger'],
});

module.exports = {
  promClient,
  commandsCounter,
  insultsSentCounter
};