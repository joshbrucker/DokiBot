const fs = require('fs');
const path = require('path');
const isUrl = require('is-url');

const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

var poemUpdate = function(message, client) {

	// Allows only DokiBot to send messages in thot-poems
    if (message.channel.name == 'doki-poems') {
    	if (message.author != client.user) {
    		message.delete();
    		return;
    	}
    }

    // Ensures that the channel "thot-poems" exists
    var poemChannel = message.guild.channels.find((channel) => channel.name === 'doki-poems');
    if (!poemChannel) {
        message.channel.send('Your server can make its own Doki Doki poems! All you have to do is create a channel titled '
    		+ '\`doki-poems\` and DokiBot will add the first word posted every interval to a poem.');
        return;
    }

    var firstWord = message.content.split(' ')[0];

    if (message.author == client.user) return;

    if (!firstWord) return;

    if (isUrl(firstWord)) return;

    if (firstWord.length > 99) return;

    db.getGuild(message.guild.id, (guild) => {
    	
	    // Prevents bot from grabbing commands used to call it
	    if (firstWord.charAt(0) == guild.prefix) {
	        return;
	    }
	    
	    if (!guild.poem_id) {
	        poemChannel.send(firstWord)
		        .then((msg) => {
		            db.savePoemId(guild.id, msg.id);
		        });
	    } else {
	        poemChannel.fetchMessage(guild.poem_id)
		        .then((msg) => {
		        	// Check time to see if it's time to grab a word
		            var messageDate = message.createdAt;
		            var poemDate;
		            if (msg.editedAt) {
		                poemDate = msg.editedAt;
		            } else {
		            	poemDate = msg.createdAt;
		            }

		            var messageTime = messageDate.getFullYear() + ' ' + messageDate.getMonth() + ' ' + messageDate.getDate();
		            var poemTime = poemDate.getFullYear() + ' ' + poemDate.getMonth() + ' ' + poemDate.getDate();

		            if (guild.poem_freq == 'hour') {
		                messageTime += ' ' + messageDate.getHours();
		                poemTime += ' ' + poemDate.getHours();
		            } else if (guild.poem_freq == 'minute') {
		                messageTime += ' ' + messageDate.getHours() + ' ' + messageDate.getMinutes();
		                poemTime += ' ' + poemDate.getHours() + ' ' + poemDate.getMinutes();
		            }

		            if (messageTime != poemTime) {
		                msg.edit(msg.content + ' ' + firstWord)
			                .then((newMsg) => {
			                    var words = newMsg.content.split(' ');
			                    if (words.length >= 20) {
			                        poemChannel.send('You wrote a full poem. Nice!');

			                        // Creates file name
			                        var filepath = '';
			                        for (let i = 0; (i < words.length) && (i < 3); i++) {
			                            if (utils.isLegalFileName(words[i])) {
			                                filepath += words[i] + ' ';
			                            }
			                        }
			                        if (filepath == '') {
			                            var d = new Date();
			                            filepath = utils.dateFormat(d) + ' ' + utils.timeFormat(d) + '.txt';
			                        } else {
			                            filepath = filepath.slice(0, filepath.length - 1) + '.txt';
			                        }

			                        // Create and send .txt file
			                        fs.writeFile(filepath, newMsg.content, (err) => {
			                            if (err) utils.errorLog(err);

			                            poemChannel.send({files: [filepath]})
				                            .then((attachment) => {
				                                fs.unlink(filepath, (err) => {
				                                    if (err) console.log(err);
				                                });

				                                db.savePoemId(guild.id, null);
				                            });
			                        });
			                    }
			                });
		            }
		        })
		        .catch((err) => {
		            if (err.message == 'Unknown Message') {
		                message.channel.send('Hmm... I can\'t seem to find your old poem. Starting a new one!');

		                poemChannel.send(firstWord)
			                .then((msg) => {
			                    fs.stat(filepath, (err, stat) => {
			                        if (!err) {
			                            fs.unlink(filepath, (err) => {
			                                if (err) console.log(err);
			                            });
			                        }
			                    });

			                    db.savePoemId(guild.id, msg.id);
			                });
		            } else {
		                console.log(err);
		            }
		        });
	    }
    });
};

module.exports = poemUpdate;
