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

var voice = require(__basedir + '/utils/voice');

var nep = function(message, args) {
	var id = message.guild.id;

	if (!message.member.voiceChannel) {
    	message.channel.send('You need to be in a voice channel to use the `nep` command!');
    	return;
	}

	// Sets up variables accessed by all voice chat operations
    if (!voice[id]) {
        voice[id] = {
        	currTask: 'nep',
        	timeout: null
        };
    } else {
    	if (voice[id].currTask) {
    		message.channel.send('Voice chat already in use!');
    		return;
    	} else {
    		voice[id].currTask = 'nep';
    	}
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
	    	message.channel.send('Can\'t find character ' + character + '!');
	    	voice[id].currTask = null;
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
	var randomInt = Math.floor(Math.random() * files.length);

	var dispatcher = connection.playFile('./assets/nep_audio/' + character + '/' + files[randomInt]);

	dispatcher.on('start', () => {
	    if (voice[id].timeout) {
	        clearTimeout(voice[id].timeout);
	        voice[id].timeout = null;
	    }
	});

	dispatcher.on('end', () => {
		voice[id].currTask = null;

	    voice[id].timeout = setTimeout(() => {
	        delete voice[id];
	        connection.disconnect();
	    }, 300000);
	});


};

module.exports = nep;