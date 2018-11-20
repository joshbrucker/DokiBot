/*
    Created by Joshua Brucker.

    What started out as a small gag to record
    so-called 'poems' has turned into a
    full-fledged Discord bot!
*/

global.__basedir = __dirname;

const Discord = require('discord.js');

const fs = require('fs');
const path = require('path');

const auth = require('./data/auth');
const utils = require('./utils/utils');
const db = require('./utils/db');
const voice = require('./utils/voice');
const commands = require('./commands/commands');
const dokiReact = require('./etc/doki-react');
const poemUpdate = require('./etc/poem-update');
const insult = require('./etc/insult.js');

const client = new Discord.Client();

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection:', p);
});

client.on('error', (error) => {
    console.log(error);
});

process.on('SIGINT', (code) => {
    for (var id in voice.servers) {
        if (voice.servers.hasOwnProperty(id)) {
        	var vc = client.guilds.get(id).voiceConnection;
        	if (vc) {
        		vc.disconnect();
        	}
        }
    }

	process.exit();
});

client.on('ready', () => {
    setInterval(() => insult(client), 60000);
    console.log('I am ready!');
});

client.on('guildCreate', (guild) => {
    db.addGuild(guild.id, () => {
        guild.systemChannel.send('Square up! Your true love has joined the server.'
            + 'You can use \`-help\` to get started. Best of luck, dummies!');
    });
});

client.on('guildDelete', (guild) => {
	db.removeGuild(guild.id);
});

client.on('message', (message) => {
	if (message.guild) {
	    db.getGuild(message.guild.id, (guild) => {

	        var prefix = guild.prefix;

	        var content = message.content.toLowerCase();

	        if (content.substring(0, prefix.length) == prefix && content.length > 1) {
	            if (message.channel.name != 'doki-poems') {
	                var args = content.substring(prefix.length).split(' ');
	                var cmd = args[0].toLowerCase();
	                args = args.splice(1);

	                switch(cmd) {
	                    case 'doki':
	                        commands.doki(message, args);
	                        break;
	                    case 'waifu':
	                        commands.waifu(message, args);
	                        break;
	                    case 'moniquote':
	                        commands.moniquote(message, args);
	                        break;
	                    case 'nep':
	                        commands.nep(message, args);
	                        break;
	                    case 'poem':
	                        if (message.guild.channels.find((channel) => channel.name === 'doki-poems')) {
	                            commands.poem(message, args);
	                        } else {
	                            message.channel.send('Your server can make its own Doki Doki poems! All you have to do is create a channel titled'
	                                + ' \`doki-poems\` and DokiBot will add the first word posted each day to a poem.');
	                        }
	                        break;
	                    case "help":
	                        commands.help(message, args);
	                        break;
	                    case "ost":
	                        commands.ost(message, args);
	                        break;
	                    case 'prefix':
	                        commands.prefix(message, args);
	                        break;
	                    case 'anime':
	                        commands.anime(message, args);
	                        break;
	                    case 'disconnect':
	                    	if (message.guild.voiceConnection) {
	                    		message.guild.voiceConnection.disconnect();
	                    	}
	                    	break;
	                }
	            }
	        }

	        poemUpdate(message, client);

	        var dokiReactChance = Math.floor(Math.random() * 3) + 1;
	        if (dokiReactChance == 3) {
	            dokiReact(message, client);
	        }
	    });
	}
});

client.login(auth.token);
