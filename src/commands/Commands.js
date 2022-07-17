const Discord = require("discord.js");

// Currently disabled because Discord Permissions V2 removed global permission setting per users...

// const AdminCommands = new Discord.Collection();
// AdminCommands.set("cache", require("./admin/cache/cache.js"));
// AdminCommands.set("db", require("./admin/db.js"));

const Commands = new Discord.Collection();
Commands.set("anime", require("./anilist/anime.js"));
Commands.set("aniuser", require("./anilist/aniuser.js"));
Commands.set("character", require("./anilist/character.js"));
Commands.set("help", require("./misc/help.js"));
Commands.set("husbando", require("./images/husbando.js"));
Commands.set("insult", require("./insult/insult.js"));
Commands.set("manga", require("./anilist/manga.js"));
Commands.set("moniquote", require("./fun/moniquote.js"));
Commands.set("neko", require("./images/neko.js"));
Commands.set("play", require("./misc/play.js"));
Commands.set("poem", require("./poem/poem.js"));
Commands.set("waifu", require("./images/waifu.js"));

module.exports = {
  // AdminCommands,
  Commands
};
