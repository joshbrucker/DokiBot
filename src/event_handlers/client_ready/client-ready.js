const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");

const auth = require(__basedir + "/auth.json");
const settings = require(__basedir + "/settings.json");
const setupDbl = require(__basedir + "/external_services/discord-bot-list.js");
const { Commands } = require(__basedir + "/commands/Commands.js");

async function onClientReady(client) {
  const rest = new REST({ version: "10" }).setToken(auth.token)
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

  // Set up Discord Bot List connection
  setupDbl(client);

  console.log("I am ready! Serving " + client.guilds.cache.size + " guilds.");
}

module.exports = onClientReady;
