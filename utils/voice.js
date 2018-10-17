var servers = {}; 
/*
	server_id: {
		task: {
			name,
			dispatcher,
			[task-specific property],
			...
			[task-specific property]
		},
		timeout
	}
*/

var leaveTime = 300000;

module.exports = {
	servers,
	leaveTime
};