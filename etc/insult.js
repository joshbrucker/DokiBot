const fs = require('fs');
const path = require('path');

const utils = require(__basedir + '/utils/utils');

/*
	Possibly move insult time from global to server-based.
	Would require a trigger per server instead of randomly
	sending at certain times.
*/

var insult = function(client) {

	fs.readFile('./data/global-data.json', (err, data) => {
		if (err) console.log(err);

		var globalData = JSON.parse(data);

		var d = new Date();
		var hours = d.getHours();
		var minutes = d.getMinutes();
		var time = hours + ((minutes >= 10) ? ':' : ':0') + minutes;

		if (time == globalData.insultTime) {
			var lines = fs.readFileSync('./assets/insults.txt').toString().split("\n");

			for (let guild of client.guilds.array()) {
				if (guild.available) {
					var message = lines[Math.floor(Math.random() * lines.length)];

					var members = utils.getMembers(guild);
					var occurrences = message.match(/%user%/g).length;
					for (let i = 0; i < occurrences; i++) {
						var index = Math.floor(Math.random() * members.length);
						var user = members[index];
						message = message.replace('%user%', '<@' + user.id + '>');

						if (members.length > 1) {
							members.splice(index, 1);
						}
					}

					var channel = utils.getGeneralChat(guild);
					if (!channel) {
						channel = utils.getMostPermissibleChannel(client, guild);
					}

					if (channel.type == 'text') {
						channel.send(message);
					}
				} else {
					console.log('Guild not available!');
				}
			}

			var newHours = Math.floor(Math.random() * 24);
			var newMinutes = Math.floor(Math.random() * 60);
			var newTime = newHours + ((newMinutes >= 10) ? ':' : ':0') + newMinutes;

			globalData.insultTime = newTime;

			fs.writeFile('./data/global-data.json', JSON.stringify(globalData), (err) => {
				if (err) console.log(err);
			});
		}
	});
};

module.exports = insult;