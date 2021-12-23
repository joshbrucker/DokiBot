const auth = require(__basedir + "/auth.json");
const Commands = require(__basedir + "/commands/Commands.js");
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");

let on_client_ready = function(client) {
  const rest = new REST({ version: '9' }).setToken(auth.token);
  const commandJSONs = Commands.map(command => command.data);

  rest.put(Routes.applicationGuildCommands(auth.clientId, auth.testGuild), { body: commandJSONs })
      .then(() => console.log('Successfully registered application commands.'))
      .catch(console.error);

  console.log('I am ready!');
}

module.exports = on_client_ready;