const voice = require(__basedir + '/utils/audio/voice');

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
    task.name = voice.TASK.SOUND;
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

    if (task.name) {
        channel.send('Voice chat already in use!');
        return;
    } else {
        createTask(task);
    }

    voice.lock(id);

    await func(server, task);

    voice.cleanup(id);
    voice.unlock(id);
};

module.exports = {
    playSound,
    createTask,
    runVoiceCmd
};