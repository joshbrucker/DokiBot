// eslint-disable-next-line no-undef
global.__basedir = __dirname;

const Discord = require("discord.js");

const auth = require("./auth.json");
const eventHandler = require("./event_handlers/event-handler.js");

const client = new Discord.Client({ intents: [ "GUILDS", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGES", "GUILD_MEMBERS" ]});

client.on("ready", () => eventHandler.onClientReady(client));

client.on("interactionCreate", (interaction) => eventHandler.onInteractionCreate(client, interaction));
client.on("guildCreate", (guild) => eventHandler.onGuildCreate(guild));
client.on("guildDelete", (guild) => eventHandler.onGuildDelete(guild));
client.on("messageCreate", (message) => eventHandler.onMessage(client, message));
client.on("messageReactionAdd", (reaction) => eventHandler.onMessageReactAdd(client, reaction));

client.login(auth.token);
