const fs = require('fs');
const path = require('path');

const voice = require(__basedir + '/utils/audio/voice');
const soundUtils = require(__basedir + '/utils/audio/sound-utils');

let nep = async function(client, message, args) {
    const id = message.guild.id;
    const channel = message.channel;

    if (!message.member.voiceChannel) {
        message.channel.send('You need to be in a voice channel to use `nep`');
        return;
    }

    soundUtils.runVoiceCmd(id, channel, async (server, task) => {
	   	let path = './assets/nep_audio/';
	    let character;
	    if (args.length == 0) {
	        folders = fs.readdirSync(path);
	        character = folders[Math.floor(Math.random() * folders.length)];
	    } else {
	        character = args[0];
	    }

	    path += character;

	    await new Promise((resolve, reject) => {
	        fs.readdir(path, async (err, files) => {
	            if (err) {
	                channel.send('Can\'t find character ' + character + '!');
	            } else {
	                let random = Math.floor(Math.random() * files.length);
	                path += '/' + files[random];

	                let emoji = client.emojis.get('522202578818301970');

	                if (message.guild.voiceConnection) {
	                    channel.send('Nepu nepu! ' + emoji);
	                    soundUtils.playSound(message, message.guild.voiceConnection, path);
	                } else {
	                    try {
	                        var conn = await message.member.voiceChannel.join();
	                        channel.send('Nepu nepu! ' + emoji);
	                        soundUtils.playSound(message, conn, path);
	                    } catch(err) {
	                        if (err.toString() == "Error: You do not have permission to join this voice channel.") {
	                            channel.send("I don't have access to your voice channel! :frowning:");
	                        } else {
	                            throw new Error(err);
	                        }
	                    }
	                }
	            }

	            resolve();
	        });
	    });
    });
};

module.exports = nep;