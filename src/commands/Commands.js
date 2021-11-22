const Discord = require("discord.js");

let Commands = new Discord.Collection();

const anime = require("./anilist/anime.js");
const waifu = require("./images/waifu.js");

Commands.set("anime", {
  data: anime.data,
  execute: anime.execute,
  aliases: []
});

Commands.set("waifu", {
  data: waifu.data,
  execute: waifu.execute,
  aliases: ["w"]
});

// Below is not looked at yet
// Commands.set("aniuser",    { run: require("./anilist/aniuser.js") });
// Commands.set("character",  {
// 	run: require("./anilist/character.js"),
// 	aliases: ["char"]
// });
// Commands.set("manga",      { run: require("./anilist/manga.js") });
//
// Commands.set("moniquote",  { run: require("./fun/moniquote.js") });
//
// Commands.set("doki",       { run: require("./images/doki.js") });
// Commands.set("neko",       { run: require("./images/neko.js") });
// Commands.set("waifu",      {
//   run: require("./images/waifu.js"),
//   aliases: ["w"]
// });
// Commands.set("husbando",   {
//   run: require("./images/husbando.js"),
//   aliases: ["h"]
// });
//
// Commands.set("submit",     { run: require("./insults/submit.js") });
// Commands.set("toggle",     { run: require("./insults/toggle.js") });
//
// Commands.set("broadcast",  { run: require("./misc/broadcast.js") });
// Commands.set("help",       { run: require("./misc/help.js") });
// Commands.set("prefix",     { run: require("./misc/prefix.js") });
// Commands.set("setchannel", { run: require("./misc/setchannel.js") });
// Commands.set("vote",       { run: require("./misc/vote.js") });
//
// Commands.set("end",        { run: require("./poems/end.js") });
// Commands.set("frequency",  {
//   run: require("./poems/frequency.js"),
//   aliases: ["freq"]
// });

module.exports = Commands;