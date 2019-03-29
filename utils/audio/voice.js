const servers = {}; 
const leaveTime = 300000;
const TASK = Object.freeze({ OST: Symbol('OST'), SOUND: Symbol('SOUND') });

let getServers = function() {
    return servers;
};

let getServer = function(id) {
    return servers[id];
};

let addServer = function(id) {
    servers[id] = {
        locked: false,
        task: {
            name: null,
            dispatcher: null
        },
        timeout: null
    };
};

let removeServer = function(id) {
    if (servers[id]) {
        delete servers[id];
    }
};

let resetTask = function(id) {
    servers[id].task = {
        name: null,
        dispatcher: null
    };
};

let lock = function(id) {
    servers[id].locked = true;
};

let unlock = function(id) {
    servers[id].locked = false;
};

let cleanup = function(id) {
    if (!servers[id].task.dispatcher && servers[id].task.name) {
        resetTask(id);
    }
};

module.exports = {
    getServers,
    getServer,
    addServer,
    removeServer,
    resetTask,
    lock,
    unlock,
    cleanup,
    leaveTime,
    TASK
};