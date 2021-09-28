global.__basedir = __dirname;

const Discord = require("discord.js");

const auth = require("./auth.json");
const event_handler = require("./discord_events/event-handler.js");
const setupDbl = require("./discord_bot_list/setup-dbl.js");

const client = new Discord.Client();

setupDbl(auth, client);

process.on("unhandledRejection", (reason) => {
  if (reason.message !== "Missing Access" && reason.message !== "Missing Permissions") {
    console.log(reason);
  }
});

process.on("uncaughtException", (err) => { console.log(err); });
client.on("error", (err) => { console.log(err); });

client.on("ready", () => { event_handler.on_client_ready(client); });
client.on("guildCreate", (guild) => { event_handler.on_guild_create(client, guild); });
client.on("guildDelete", (guild) => { event_handler.on_guild_delete(client, guild); });
client.on("message", (message) => { event_handler.on_message(client, message); });
client.on("messageReactionAdd", (reaction, user) => { event_handler.on_message_react(client, reaction); });
client.on("voiceStateUpdate", (oldState, newState) => { event_handler.on_voice_state_change(client, oldState, newState); });

client.login(auth.token);