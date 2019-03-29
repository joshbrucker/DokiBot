const YTDL = require('ytdl-core');

const voice = require(__basedir + '/utils/audio/voice');

let playMusic = function(message, connection) {
    const id = message.guild.id;

    const server = voice.getServer(id);
    const task = server.task;

    task.dispatcher = connection.play(YTDL(task.queue[0].url, {filter: 'audioonly'}));

    task.dispatcher.once('start', () => {
        connection.player.streamingData.pausedTime = 0;
        if (server.timeout) {
            clearTimeout(server.timeout);
            server.timeout = null;
        }
    });

    task.dispatcher.once('end', () => {
        task.queue.shift();

        if (task.queue[0]) {
            playMusic(message, connection);
        } else {
            voice.resetTask(id);

            server.timeout = setTimeout(() => {
                voice.removeServer(id);
                connection.disconnect();
            }, voice.leaveTime);
        }
    });
};

let createTask = function(task) {
    task.name = voice.TASK.OST;
    if (task.queue == undefined) {
        task.queue = [];
    }
    if (task.pauseTimeout == undefined) {
        task.pauseTimeout = null;
    }
};

let runVoiceCmd = async function(id, channel, func) {
    if (!voice.getServer(id)) {
        voice.addServer(id);
    }

    const server = voice.getServer(id);
    const task = server.task;

    if (server.locked) {
        return;
    }

    if (!task.name) {
        createTask(task);
    } else if (task.name != voice.TASK.OST) {
        channel.send('Voice chat already in use!');
        return;
    }

    voice.lock(id);

    await func(server, task);

    voice.cleanup(id);
    voice.unlock(id);
};

module.exports = {
    playMusic,
    createTask,
    runVoiceCmd
};