// eslint-disable-next-line no-undef
global.__basedir = __dirname;

const { ShardingManager } = require("discord.js");
const { AutoPoster } = require("topgg-autoposter");

const auth = require("./auth.json");
const settings = require("./settings.json");
const startWebserver = require("./webserver.js");

const shardingManager = new ShardingManager("./bot.js", { token: auth.token });

// Auto-send metrics to Top.gg if enabled
if (settings.sendTopggMetrics) {
  const topggAutoPoster = AutoPoster(auth.topggToken, shardingManager);
  topggAutoPoster.on('posted', (stats) => {
    console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`)
  });
}

// Start webserver for Top.gg webhook and Prometheus metrics
startWebserver();

shardingManager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));
shardingManager.spawn();
