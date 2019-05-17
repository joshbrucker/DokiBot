const fs = require('fs');
const path = require('path');

const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');

let nep = function(message, args) {
    const id = message.guild.id;
    const client = message.client;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;

    if (!message.member.voice.channel) {
        message.channel.send('You need to be in a voice channel to use `nep`');
        return;
    }

    if (!task.name) {
        voiceTasks.createSoundTask(task);
    } else {
        channel.send('Voice chat already in use!');
        return;
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

            voice.getConnection(message)
                .then(conn => {
                    channel.send('Nepu nepu! ' + emoji.toString());
                    voice.playSound(message, server, conn, path);
                });
        }
    });
};

module.exports = nep;