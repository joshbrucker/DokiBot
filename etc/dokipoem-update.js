const fs = require('fs');
const path = require('path');
const isUrl = require('is-url');
const validFilename = require('valid-filename');

const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

var dokipoemUpdate = function(guild, message, client) {
    // Allows only DokiBot to send messages in doki-poems
    if (message.channel.name == 'doki-poems') {
        if (message.author != client.user) {
            message.delete(10);
            return;
        }
    }

    var poemChannel = message.guild.channels.find((channel) => channel.name === 'doki-poems');
    if (!poemChannel) return;

    if (message.author == client.user) return;

    var firstWord = message.content.split(' ')[0];
    if (!firstWord) return;

    if (isUrl(firstWord)) return;

    if (firstWord.length > 99) return;

    if (firstWord.charAt(0) == guild.prefix || firstWord.includes('@everyone')) {
        return;
    }
    
    if (!guild.poem_id) {
        poemChannel.send(firstWord)
            .then((msg) => {
                db.guild.setPoemId(guild.id, msg.id);
            });
    } else {
        var filepath = '';

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
                                poemChannel.send('You wrote a full doki-poem. Nice!');

                                // Creates file name
                                for (let i = 0; (i < words.length) && (i < 3); i++) {
                                    if (validFilename(words[i])) {
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
                                    if (err) console.log(err);

                                    poemChannel.send({files: [filepath]})
                                        .finally(() => {
                                            fs.stat(filepath, (err, stat) => {
                                                if (!err) {
                                                    fs.unlink(filepath, (err) => {
                                                        if (err) console.log(err);
                                                    });
                                                }
                                            });
                                        });
                                });

                                db.guild.setPoemId(guild.id, null);
                            }
                        });
                }
            })
            .catch((err) => {
                if (err.message == 'Unknown Message') {
                    message.channel.send('Hmm... I can\'t seem to find your old doki-poem. Starting a new one...!');
                    poemChannel.send(firstWord)
                        .then((msg) => {
                            db.guild.setPoemId(guild.id, msg.id);
                        });
                } else {
                    throw err;
                }
            });
    }
};

module.exports = dokipoemUpdate;
