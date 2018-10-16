const fs = require('fs');
const path = require('path');

const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

var poem = function(message, args) {
    if (args.length >= 1) {
        var poemChannel = message.guild.channels.find((channel) => channel.name === 'doki-poems');

        if (poemChannel) {
            db.getGuild(message.guild.id, (guild) => {
                switch (args[0].toLowerCase()) {
                    case 'end':
                        if (!guild.poem_id) {
                            message.channel.send('You can\'t end a poem you didn\'t start...');
                        } else {
                            poemChannel.fetchMessage(guild.poem_id).then((msg) => {
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

                                message.channel.send('Ending your poem early? I didn\'t expect much more from you...');
                                poemChannel.send('<@' + message.member.id + '> decided to end the poem early :frowning:');

                                // Creates the .txt file
                                fs.writeFile(filepath, msg.content, (err) => {
                                    if (err) console.log(err);

                                    // Sends the .txt file
                                    poemChannel.send({files: [filepath]})
                                        .then((attachment) => {
                                            fs.unlink(filepath, (err) => {
                                                if (err) console.log(err);
                                            });

                                            db.savePoemId(guild.id, null);
                                        });
                                });
                            })
                            .catch((err) => {
                                if (err.message == 'Unknown Message') {
                                    message.channel.send('Hmm... I can\'t seem to find my old poem. Starting a new one!');

                                    fs.stat(filepath, (err, stat) => {
                                        if (!err) {
                                            fs.unlink(filepath, (err) => {
                                                if (err) console.log(err);
                                            });
                                        }
                                    });

                                    db.savePoemId(guild.id, null);
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                        break;
                    case 'frequency':
                        if (args.length == 2) {
                            var freq;
                            switch (args[1].toLowerCase()) {
                                case 'day':
                                    freq = 'day';
                                    message.channel.send('Interval changed! I\'ll grab the first word of each `day`.');
                                    break;
                                case 'hour':
                                    freq = 'hour';
                                    message.channel.send('Interval changed! I\'ll grab the first word of each `hour`.');
                                    break;
                                case 'minute':
                                    freq = 'minute';
                                    message.channel.send('Interval changed! I\'ll grab the first word of each `minute`.');
                                    break;
                                default:
                                    utils.invalidArgsMsg(message, 'poem');
                                    return;
                            }

                            db.savePoemFreq(guild.id, freq);
                        } else {
                            utils.invalidArgsMsg(message, 'poem');
                        }
                        break;
                    default:
                        utils.invalidArgsMsg(message, 'poem');
                }
            });
        } else {
            message.channel.send('Hey dummy, if you want to use poem commands, you need a doki-poems channel!');
        }
    }
}

module.exports = poem;
