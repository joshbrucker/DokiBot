const Discord = require('discord.js');

let Commands = new Discord.Collection();

Commands.set('anime',      { run: require('./fun/anime.js') });
Commands.set('moniquote',  { run: require('./fun/moniquote.js') });
Commands.set('doki',       { run: require('./images/doki.js') });
Commands.set('neko',       { run: require('./images/neko.js') });
Commands.set('waifu',      {
  run: require('./images/waifu.js'),
  aliases: ['w']
});
Commands.set('husbando',      {
  run: require('./images/husbando.js'),
  aliases: ['h']
});

Commands.set('submit',     { run: require('./insults/submit.js') });
Commands.set('toggle',     { run: require('./insults/toggle.js') });

Commands.set('broadcast',  { run: require('./misc/broadcast.js') });
Commands.set('help',       { run: require('./misc/help.js') });
Commands.set('prefix',     { run: require('./misc/prefix.js') });
Commands.set('setchannel', { run: require('./misc/setchannel.js') });
Commands.set('vote',       { run: require('./misc/vote.js') });

Commands.set('clear',      { run: require('./ost/clear.js') });
Commands.set('list',       { run: require('./ost/list.js') });
Commands.set('pause',      { run: require('./ost/pause.js') });
Commands.set('play',       { run: require('./ost/play.js') });
Commands.set('playall',    { run: require('./ost/playall.js') });
Commands.set('queue',      { run: require('./ost/queue.js') });
Commands.set('resume',     { run: require('./ost/resume.js') });
Commands.set('skip',       { run: require('./ost/skip.js') });
Commands.set('stop',       { run: require('./ost/stop.js') });

Commands.set('end',        { run: require('./poems/end.js') });
Commands.set('frequency',  {
  run: require('./poems/frequency.js'),
  aliases: ['freq']
});

Commands.set('nep',        { run: require('./sounds/nep.js')});

module.exports = Commands;