const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");

const auth = require(__basedir + "/auth.json");
const settings = require(__basedir + "/settings.json");
const setupDbl = require(__basedir + "/external_services/discord-bot-list.js");
const { cacheSubmissionChannel } = require(__basedir + "/utils/utils.js");
const { Commands } = require(__basedir + "/commands/Commands.js");

async function onClientReady(client) {
  const rest = new REST({ version: "10" }).setToken(auth.token)
  const commandsJson = Commands.map(command => command.data);

  // Register commands
  if (settings.developerMode) {
    await rest.put(Routes.applicationGuildCommands(client.user.id, auth.testGuild), { body: commandsJson });
  } else {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commandsJson });
  }

  // Set up Discord Bot List connection
  setupDbl(auth, client);

  // Cache messages in submission channel
  await cacheSubmissionChannel(client);

  console.log("I am ready!");
}

module.exports = onClientReady;
