const Cache = require(global.__basedir + "/cache/Cache.js");

async function execute(interaction) {
  Cache.flush();
  await interaction.reply("Cache has been flushed!");
}

module.exports = execute;
