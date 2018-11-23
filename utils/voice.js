var servers = {}; 

var leaveTime = 300000;

var getServers = function() {
	return servers;
};

var getServer = function(id) {
	if (!servers[id]) {
        servers[id] = {
            task: {
            	name: null,
            	dispatcher: null
            },
            timeout: null
        };
	}

	return servers[id];
};

var removeServer = function(id) {
	if (servers[id]) {
		delete servers[id];
	}
};

module.exports = {
	getServers,
	getServer,
	removeServer,
	leaveTime
};