// Poems
const end = require(__basedir + '/commands/poems/end');
const frequency = require(__basedir + '/commands/poems/frequency');

// Insults
const submit = require(__basedir + '/commands/insults/submit');
const toggle = require(__basedir + '/commands/insults/toggle');

// Fun
const anime = require(__basedir + '/commands/fun/anime');
const moniquote = require(__basedir + '/commands/fun/moniquote');

// Images
const doki = require(__basedir + '/commands/images/doki');
const neko = require(__basedir + '/commands/images/neko');
const waifu = require(__basedir + '/commands/images/waifu');

// Sounds
const nep = require(__basedir + '/commands/sounds/nep');

// Music
const play = require(__basedir + '/commands/ost/play');
const playall = require(__basedir + '/commands/ost/playall');
const list = require(__basedir + '/commands/ost/list');
const stop = require(__basedir + '/commands/ost/stop');
const pause = require(__basedir + '/commands/ost/pause');
const resume = require(__basedir + '/commands/ost/resume');
const skip = require(__basedir + '/commands/ost/skip');
const queue = require(__basedir + '/commands/ost/queue');
const clear = require(__basedir + '/commands/ost/clear');

// Miscellaneous
const help = require(__basedir + '/commands/misc/help');
const setchannel = require(__basedir + '/commands/misc/setchannel');
const prefix = require(__basedir + '/commands/misc/prefix');
const vote = require(__basedir + '/commands/misc/vote');

// Special Commands
const broadcast = require(__basedir + '/commands/broadcast');

let executeCmd = function(client, guild, message, args, cmd) {
    if (cmd != 'submit') {
        args = args.map((arg) => arg.toLowerCase());
    }

    switch(cmd) {

        //Poem
        case 'end':
            end(guild, message, args);
            break;
        case 'freq':
        case 'frequency':
            frequency(guild, message, args);
            break;

        // Insults
        case 'submit':
            submit(client, guild, message, args);
            break;
        case 'toggle':
            toggle(guild, message, args);
            break;

        // Fun
        case 'anime':
            anime(message, args);
            break;
        case 'moniquote':
            moniquote(message, args);
            break;

        // Images
        case 'doki':
            doki(client, message, args);
            break;
        case 'catgirl':
        case 'neko':
            neko(client, message, args);
            break;
        case 'waifu':
            waifu(client, message, args);
            break;

        // Sounds
        case 'nep':
            nep(client, message, args);
            break;

        // Music
        case 'play':
            play(message, args);
            break;
        case 'playall':
            playall(message, args);
            break;
        case 'list':
            list(message, args);
            break;
        case 'stop':
            stop(message, args);
            break;
        case 'pause':
            pause(message, args);
            break;
        case 'resume':
            resume(message, args);
            break;
        case 'skip':
            skip(message, args);
            break;
        case 'queue':
            queue(message, args);
            break;
        case 'clear':
            clear(message, args);
            break;

        // Miscellaneous
        case 'help':
            help(client, guild, message, args);
            break;
        case 'setchannel':
            setchannel(client, message, args);
            break;
        case 'prefix':
            prefix(message, args);
            break;
        case 'vote':
            vote(message);
            break;
    }

    if (cmd == 'broadcast') {
        args = message.content.split(' ').splice(1);
        broadcast(client, message, args);
    }
};

module.exports = executeCmd;