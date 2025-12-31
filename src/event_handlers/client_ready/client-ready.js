const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");

const auth = require(global.__basedir + "/auth.json");
const settings = require(global.__basedir + "/settings.json");
const { Commands } = require(global.__basedir + "/commands/Commands.js");

async function onClientReady(client) {
  const rest = new REST({ version: "10" }).setToken(auth.token);
  const commandsJson = Commands.map(command => command.data);

  // Register commands
  if (settings.developerMode) {
    await rest.put(Routes.applicationGuildCommands(client.user.id, settings.testGuild), { body: commandsJson });
  } else {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commandsJson });
  }

  // Initial cache of messages in submission channel
  let channel = await client.channels.resolve(settings.insults.submissionChannel);
  if (channel) {
    await channel.messages.fetch();
  }

  console.log(`I'm ready! Writing poetry with ${client.guilds.cache.size} guilds.`);
}

module.exports = onClientReady;
