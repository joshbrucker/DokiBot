const promClient = require('prom-client');

// Collect default Node.js metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics();

// Custom metrics
const commandsCounter = new promClient.Counter({
  name: 'discord_commands_total',
  help: 'Total number of Discord commands used',
  labelNames: ['command'],
});

module.exports = {
  promClient,
  commandsCounter,
};