/*
	This file compiles all the commands to avoid 
	excessive require statements in bot.js
*/

const animeCmd = require('./anime');
const dokiCmd = require('./doki');
const helpCmd = require('./help');
const moniquoteCmd = require('./moniquote');
const nepCmd = require('./nep');
const ostCmd = require('./ost');
const poemCmd = require('./poem');
const prefixCmd = require('./prefix');
const waifuCmd = require('./waifu');

var commands = {
	anime: animeCmd,
	doki: dokiCmd,
	help: helpCmd,
	moniquote: moniquoteCmd,
	nep: nepCmd,
	ost: ostCmd,
	poem: poemCmd,
	prefix: prefixCmd,
	waifu: waifuCmd
};

module.exports = commands;