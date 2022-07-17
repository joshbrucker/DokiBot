global.__basedir = __dirname;

const Discord = require("discord.js");

const auth = require("./auth.json");
const event_handler = require("./event_handlers/event-handler.js");

const client = new Discord.Client({ intents: [ "GUILDS", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGES" ] });

client.on("ready", () => event_handler.onClientReady(client));

client.on("interactionCreate", (interaction) => event_handler.onInteractionCreate(client, interaction));
client.on("guildCreate", (guild) => event_handler.onGuildCreate(guild));
client.on("guildDelete", (guild) => event_handler.onGuildDelete(guild));
client.on("messageCreate", (message) => event_handler.onMessage(client, message));
client.on("messageReactionAdd", (reaction, user) => event_handler.onMessageReactAdd(client, reaction));
client.on("messageReactionRemove", (reaction, user) => event_handler.onMessageReactRemove(client, reaction));

client.login(auth.token);
