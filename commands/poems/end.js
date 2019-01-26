const fs = require('fs');
const path = require('path');
const validFilename = require('valid-filename');

const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

let end = function(guild, message, args) {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
        return;
    }

    let poemChannel = message.guild.channels.find((channel) => channel.name === 'doki-poems');

    if (!poemChannel) {
        message.channel.send('Hey dummy, if you want to use dokipoem commands, you need a `doki-poems` channel!');
        return;
    }

    if (!guild.poem_id) {
        message.channel.send('You can\'t end a doki-poem you didn\'t start...');
        return;
    }

    let filepath = '';

    poemChannel.fetchMessage(guild.poem_id).then((msg) => {
        let words = msg.content.split(' ');
        for (let i = 0; (i < words.length) && (i < 3); i++) {
            if (validFilename(words[i])) {
                filepath += words[i] + ' ';
            }
        }
        if (filepath == '') {
            let d = new Date();
            filepath = utils.dateFormat(d) + ' ' + utils.timeFormat(d) + '.txt';
        } else {
            filepath = filepath.slice(0, filepath.length - 1) + '.txt';
        }

        message.channel.send('Ending your doki-poem early? I didn\'t expect much more from you...');
        poemChannel.send('<@' + message.member.id + '> decided to end the doki-poem early :frowning:');

        // Creates the .txt file
        fs.writeFile(filepath, msg.content, (err) => {
            if (err) console.log(err);

            // Sends the .txt file
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
    })
    .catch((err) => {
        if (err.message == 'Unknown Message') {
            message.channel.send('Hmm... I can\'t seem to find my old doki-poem. Let\'s start a new one!');
            db.guild.setPoemId(guild.id, null);
        } else {
            throw err;
        }
    });
};

module.exports = end;