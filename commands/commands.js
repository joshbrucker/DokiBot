/*
    This file compiles all the commands to avoid 
    excessive require statements in bot.js
*/

const animeCmd = require('./anime');
const broadcastCmd = require('./broadcast');
const dokiCmd = require('./doki');
const helpCmd = require('./help');
const moniquoteCmd = require('./moniquote');
const nekoCmd = require('./neko');
const nepCmd = require('./nep');
const ostCmd = require('./ost');
const dokipoemCmd = require('./dokipoem');
const prefixCmd = require('./prefix');
const waifuCmd = require('./waifu');
const insultCmd = require('./insult');

var commands = {
    anime: animeCmd,
    broadcast: broadcastCmd,
    doki: dokiCmd,
    help: helpCmd,
    moniquote: moniquoteCmd,
    neko: nekoCmd,
    nep: nepCmd,
    ost: ostCmd,
    dokipoem: dokipoemCmd,
    prefix: prefixCmd,
    waifu: waifuCmd,
    insult: insultCmd
};

module.exports = commands;