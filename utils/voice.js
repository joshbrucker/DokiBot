const servers = {}; 

const leaveTime = 300000;

const TASK = Object.freeze({ OST: Symbol('OST'), NEP: Symbol('NEP') });

let getServers = function() {
    return servers;
};

let getServer = function(id) {
    return servers[id];
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

module.exports = {
    getServers,
    getServer,
    addServer,
    removeServer,
    resetTask,
    leaveTime,
    TASK
};