const YTDL = require('ytdl-core');

const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');

const leaveTime = 300000;

let getConnection = function(message) {
    return new Promise((resolve, reject) => {
        if (!message.guild.voiceConnection) {
            message.member.voice.channel.join()
                .then(conn => {
                    resolve(conn);
                })
                .catch(err => {
                    if (err.toString() == 'Error [VOICE_JOIN_CHANNEL]: You do not have permission to join this voice channel.') {
                        channel.send('I don\'t have access to your voice channel! :frowning:');
                    } else {
                        reject();
                    }
                });
        } else {
            resolve(message.guild.voiceConnection);
        }
    });
}

let playMusic = function(message, server, conn) {
    const id = message.guild.id;
    const task = server.task;

    task.dispatcher = conn.play(YTDL(task.queue[0].url, {filter: 'audioonly'}));

    task.dispatcher.once('start', () => {
        conn.player.streamingData.pausedTime = 0;
        if (server.timeout) {
            clearTimeout(server.timeout);
            server.timeout = null;
        }
    });

    task.dispatcher.once('end', () => {
        task.queue.shift();
        if (task.queue[0]) {
            playMusic(message, server, conn);
        } else {
            server.task = voiceTasks.createEmptyTask();
            server.timeout = setTimeout(() => {
                voiceTasks.removeServer(id);
                conn.disconnect();
            }, leaveTime);
        }
    });
};

let playSound = function(message, server, conn, path) {
    const id = message.guild.id;
    const task = server.task;

    task.dispatcher = conn.play(path);

    task.dispatcher.once('start', () => {
        if (server.timeout) {
            clearTimeout(server.timeout);
            server.timeout = null;
        }
    });

    task.dispatcher.once('end', () => {
        server.task = voiceTasks.createEmptyTask(id);

        server.timeout = setTimeout(() => {
            voiceTasks.removeServer(id);
            conn.disconnect();
        }, leaveTime);
    });
};

module.exports = {
    getConnection,
    playMusic,
    playSound,
    leaveTime
};