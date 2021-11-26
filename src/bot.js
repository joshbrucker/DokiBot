global.__basedir = __dirname;

const Discord = require("discord.js");
const setupDbl = require("./external_services/discord_bot_list/setup-dbl.js");
const auth = require("./auth.json");
const event_handler = require("./event_handlers/event-handler.js");

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGE_REACTIONS"] });

// Set up the Discord Bot List connection
// setupDbl(auth, client);

// Set client event handlers
client.on("ready", () => event_handler.on_client_ready(client));
// client.on("guildCreate", (guild) => { event_handler.on_guild_create(client, guild); });
// client.on("guildDelete", (guild) => { event_handler.on_guild_delete(client, guild); });
client.on("interactionCreate", (interaction) => event_handler.on_interaction_create(client, interaction));
// client.on("messageCreate", (message) => { event_handler.on_message(client, message); });
client.on("messageReactionAdd", (reaction, user) => { event_handler.on_message_react_add(client, reaction); });
client.on("messageReactionRemove", (reaction, user) => { event_handler.on_message_react_remove(client, reaction); });
// client.on("voiceStateUpdate", (oldState, newState) => { event_handler.on_voice_state_change(client, oldState, newState); });

client.login(auth.token);

console.log("uwu");