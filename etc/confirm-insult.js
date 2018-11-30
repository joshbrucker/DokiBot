const fs = require('fs');
const db = require(__basedir + '/utils/db');

let confirmInsult = function(client, reaction) {
	let message = reaction.message;
	if (reaction.emoji.toString() == '✅') {
		let content = message.content.split('\n\n');
		
		let data = content.pop();
		data = data.split('\n');
		let id = data[0].split(' ')[1];

		content = content.join(' ');

		client.fetchUser(id)
			.then((user) => {
				user.send('Your insult has been accepted!')
					.then((msg) => {
						user.send(content);
					});
			});

		db.insult.addInsult(content, id);
		message.delete();
	} else if (reaction.emoji.toString() == '❌') {
		message.delete();
	}
};

module.exports = confirmInsult;