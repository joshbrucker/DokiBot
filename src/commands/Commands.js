const Discord = require("discord.js");

let Commands = new Discord.Collection();

Commands.set("anime", require("./anilist/anime.js"));
Commands.set("aniuser", require("./anilist/aniuser.js"));
Commands.set("character", require("./anilist/character.js"));
Commands.set("husbando", require("./images/husbando.js"));
Commands.set("manga", require("./anilist/manga.js"));
Commands.set("moniquote", require("./fun/moniquote.js"));
Commands.set("neko", require("./images/neko.js"));
Commands.set("poem", require("./fun/poem.js"));
Commands.set("waifu", require("./images/waifu.js"));

module.exports = Commands;
