const fs = require('fs');
const path = require('path');
const Danbooru = require('danbooru');

const utils = require(__basedir + '/utils/utils');

var waifu = function(message, args) {

	var waifuName;
	var rating = 'safe';
	var channel = message.channel;

	fs.readFile('./assets/waifus.txt', (err, data) => {
		var lines = data.toString().split('\n');
		var lineNum = Math.floor(Math.random() * lines.length);
		waifuName = lines[lineNum];

		if (args.length == 0) {
			sendWaifu(channel, rating, waifuName);
		} else {
			if (args[0] == 'nsfw') {
				if (channel.nsfw) {
					if (Math.floor(Math.random() * 2)) {
						rating = 'questionable';
					} else {
						rating = 'explicit';
					}
					sendWaifu(channel, rating, waifuName);
				} else {
					channel.send("Woah now! This text channel isn't marked NSFW. I probably shouldn't post the steamy stuff here.");
				}
			} else {
				utils.invalidArgsMsg(message, 'waifu');
			}
		}
	});
};

var sendWaifu = function(channel, rating, waifuName) {

	const booru = new Danbooru();

	booru.posts({ random: true, limit: 5, tags: waifuName.toLowerCase() + ' rating:' + rating 
		+ ((rating == 'safe') ? ' 1girl' : '') })

		.then((posts) => {
			const index = Math.floor(Math.random() * posts.length);
		  	const post = posts[index];
		  	const url = booru.url(post.file_url);
		  	const name = `${post.md5}.${post.file_ext}`;

		  	if (post.tag_string.includes('loli') || post.tag_string.includes('shota')) {
		  		channel.send("I can't post this picture of " + waifuName + " because it's tagged with loli/shota.");
		  	} else {
			  	channel.send("Waifu: **" + utils.toTitleCase(waifuName) + "**\n\n"
			  		+ "From: **" + utils.toTitleCase(post.tag_string_copyright) + "**\n"
			  		+ url.href);
		  	}
		})
		.catch((err) => {
			channel.send("Can't find any " + rating + " pictures of " + utils.toTitleCase(waifuName) + "! :(");
		});
};

module.exports = waifu;