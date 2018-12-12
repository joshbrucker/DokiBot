const fs = require('fs');
const path = require('path');
const YTDL = require('ytdl-core');
const Discord = require('discord.js');

const voice = require(__basedir + '/utils/voice');

let nep = function(client, message, args) {
    const id = message.guild.id;
    const channel = message.channel;

    if (!message.member.voiceChannel) {
        message.channel.send('You need to be in a voice channel to use `nep`');
        return;
    }

    // Voice setup
    if (!voice.getServer(id)) {
        voice.addServer(id);
    }

    const server = voice.getServer(id);
    const task = server.task;

    if (task.name) {
        channel.send('Voice chat already in use!');
        return;
    } else {
        createTask(task);
    }

    let path = './assets/nep_audio/';
    let character;
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
            let random = Math.floor(Math.random() * files.length);
            path += '/' + files[random];

            let emoji = client.emojis.get('522202578818301970');

            if (message.guild.voiceConnection) {
                channel.send('Nepu nepu! ' + emoji);
                playSound(message, message.guild.voiceConnection, path);
            } else {
                message.member.voiceChannel.join()
                    .then((connection) => {
                        channel.send('Nepu nepu! ' + emoji);
                        playSound(message, connection, path);
                    })
                    .catch((err) => {
                        if (err.toString() == "Error: You do not have permission to join this voice channel.") {
                            channel.send("I don't have access to your voice channel! :frowning:");
                            voice.removeServer(id);
                        } else {
                            console.log(err);
                        }
                    });
            }
        }
    });
};

let playSound = function(message, connection, path) {
    const id = message.guild.id;

    const server = voice.getServer(id);
    const task = server.task;

    task.dispatcher = connection.playFile(path);

    task.dispatcher.once('start', () => {
        if (server.timeout) {
            clearTimeout(server.timeout);
            server.timeout = null;
        }
    });

    task.dispatcher.once('end', () => {
        voice.resetTask(id);

        server.timeout = setTimeout(() => {
            voice.removeServer(id);
            connection.disconnect();
        }, voice.leaveTime);
    });


};

let createTask = function(task) {
    task.name = voice.TASK.NEP;
};

module.exports = nep;