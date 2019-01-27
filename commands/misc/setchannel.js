const db = require(__basedir + '/utils/db');
const utils = require(__basedir + '/utils/utils');

let setchannel = function(client, message, args) {
	if (args.length == 0) {
		utils.invalidArgsMsg(message, 'setchannel');
		return;
	}

	args = args.join(' ');

	let channel = message.guild.channels.find((channel) => channel.id === utils.stripToNums(args));
	if (!channel) {
		channel = message.guild.channels.find((channel) => channel.name === args);
	}

	if (channel) {
		db.guild.setDefaultChannel(message.guild.id, channel.id);
		message.channel.send('Default channel changed to <#' + channel.id + '>');
		if (!channel.permissionsFor(client.user).has('SEND_MESSAGES')
				|| !channel.permissionsFor(client.user).has('VIEW_CHANNEL')) {
			message.channel.send('But I am missing perms to:\n'
					+ (!channel.permissionsFor(client.user).has('SEND_MESSAGES') ? '-**Send Messages**\n' : '')
					+ (!channel.permissionsFor(client.user).has('VIEW_CHANNEL') ? '-**Read Messages**' : ''));
		}
	} else {
		message.channel.send('Hmmm... I can\'t find that channel. Make sure I have perms to see it!');
	}
};

module.exports = setchannel;