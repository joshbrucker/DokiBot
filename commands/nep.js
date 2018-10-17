/*
	Voice chat commands are new and still buggy.
	There's overlap that still needs to be checked
	and fixed between nep.js and ost.js
*/

const fs = require('fs');
const path = require('path');
const player = require('play-sound');
const YTDL = require('ytdl-core');
const Discord = require('discord.js');

const voice = require(__basedir + '/utils/voice');

var nep = function(message, args) {
	var id = message.guild.id;
	var channel = message.channel;

	if (!message.member.voiceChannel) {
    	message.channel.send('You need to be in a voice channel to use `nep`');
    	return;
	}

	// Sets up serverwide voice chat management
	if (!voice.servers[id]) {
		voice.servers[id] = {
			task: {
				name: null,
				dispatcher: null
			},
			timeout: null
		};
	}

	const server = voice.servers[id];
	const task = server.task;

    if (task.name) {
        channel.send('Voice chat already in use through the `' + task.name + '` command!');
        return;
    }

    var character;
    if (args.length == 0) {
	    folders = fs.readdirSync('./assets/nep_audio/');
	    character = folders[Math.floor(Math.random() * folders.length)];
    } else {
    	character = args[0];
    }

	fs.readdir(('./assets/nep_audio/' + character), (err, files) => {
		if (err) {
	    	channel.send('Can\'t find character ' + character + '!');
	    } else {
	    	if (!message.guild.voiceConnection) {
       			message.member.voiceChannel.join()
       				.then((connection) => {
		    			playSound(message, connection, files, character);
       				});
       		} else {
       			playSound(message, message.guild.voiceConnection, files, character);
       		}
	    }
	});
};

var playSound = function(message, connection, files, character) {
	var id = message.guild.id;
	const server = voice.servers[id];
    const task = server.task;
    
	var randomInt = Math.floor(Math.random() * files.length);

	task.name = 'nep';

	task.dispatcher = connection.playFile('./assets/nep_audio/' + character + '/' + files[randomInt]);

	task.dispatcher.once('start', () => {
	    if (server.timeout) {
	        clearTimeout(server.timeout);
	        server.timeout = null;
	    }
	});

	task.dispatcher.once('end', () => {
		server.task = {
			name: null,
			dispatcher: null
		};

	    server.timeout = setTimeout(() => {
	        delete voice.servers[id];
	        connection.disconnect();
	    }, voice.leaveTime);
	});


};

module.exports = nep;