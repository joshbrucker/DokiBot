const https = require('https');

const utils = require(__basedir + '/utils/utils');

var neko = function(message, args) {
	var id = message.guild.id;
	var channel = message.channel;

	var tag;

	if (args == 0) {
		tag = 'neko';
	} else if (args.length == 1 && args[0] == 'nsfw') {
		if (channel.nsfw) {
			tag = 'lewd';
		} else {
			channel.send('I know you like lewd nekos, but you have to use a NSFW channel OwO');
			return;
		}
	} else {
		utils.invalidArgsMsg(message, 'neko');
		return;
	}

	https.get('https://nekos.life/api/v2/img/' + tag, (resp) => {
		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			data = JSON.parse(data);
			channel.send(data['url']);
		});
	})
	.on('error', (err) => {
		console.log('HTTPS Error: ' + err.message);
	});
}

module.exports = neko;