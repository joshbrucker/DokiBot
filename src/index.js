const { ShardingManager } = require('discord.js');
const auth = require('./auth.json');

const manager = new ShardingManager('./bot.js', { token: auth.token, totalShards: 3 });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();
