const fs = require('fs');
const path = require('path');
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

    const server = voice.getServer(id);
    const task = server.task;

    if (task.name) {
        channel.send('Voice chat already in use through the `' + task.name + '` command!');
        return;
    }

    var path = './assets/nep_audio/';
    var character;
    if (args.length == 0) {
        folders = fs.readdirSync(path);
        character = folders[Math.floor(Math.random() * folders.length)];
    } else {
        character = args[0];
    }

    path += character;

    fs.readdir(path, (err, files) => {
        if (err) {
            channel.send('Can\'t find character ' + character + '!');
        } else {
            var random = Math.floor(Math.random() * files.length);
            path += '/' + files[random];

            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join()
                    .then((connection) => {
                        playSound(message, connection, path);
                    })
                    .catch((err) => {
                        if (err.toString() == "Error: You do not have permission to join this voice channel.") {
                            channel.send("I don't have access to your voice channel! :frowning:");
                        } else {
                            console.log(err);
                        }
                    });
            } else {
                playSound(message, message.guild.voiceConnection, path);
            }
        }
    });
};

var playSound = function(message, connection, path) {
    var id = message.guild.id;
    const server = voice.getServer(id);
    const task = server.task;

    task.name = 'nep';

    task.dispatcher = connection.playFile(path);

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
            voice.removeServer(id);
            connection.disconnect();
        }, voice.leaveTime);
    });


};

module.exports = nep;