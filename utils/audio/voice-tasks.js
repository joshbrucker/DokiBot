const servers = {};
const TASK = Object.freeze({ OST: Symbol('OST'), SOUND: Symbol('SOUND') });

let getServers = function() {
    return servers;
};

let addServer = function(id) {
    servers[id] = {
        task: {
            name: null,
            dispatcher: null
        },
        timeout: null
    };
};

let getServer = function(id) {
    if (!servers[id]) {
        addServer(id);
    }
    return servers[id];
};

let removeServer = function(id) {
    if (servers[id]) {
        delete servers[id];
    }
};

let createEmptyTask = function() {
    let task = {
        name: null,
        dispatcher: null,
        timeout: null
    };
    return task;
};

let createMusicTask = function(task) {
    task.name = TASK.OST;
    if (task.queue == undefined) {
        task.queue = [];
    }
};

let createSoundTask = function(task) {
    task.name = TASK.SOUND;
};

module.exports = {
    TASK,
    getServers,
    addServer,
    getServer,
    removeServer,
    createEmptyTask,
    createMusicTask,
    createSoundTask
};