const fs = require('fs');
const path = require('path');
const isUrl = require('is-url');
const validFilename = require('valid-filename');

const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

const COMMON_PREFIXES = /^(-|--|=|==|\$|.?\!|%|&|\^|>|<|\*|~|`|.?\?|\+|\+\+).*/

let dokipoemUpdate = function(client, guild, message) {
  let poemChannel = message.guild.channels.cache.find((channel) => channel.name === 'doki-poems');
  if (!poemChannel) return;

  if (!poemChannel.permissionsFor(client.user).has('SEND_MESSAGES')) {
      return;
  }
 
  if (message.author == client.user) return;

  let firstWord = message.content.split(' ')[0];
  if (!firstWord) return;

  if (isUrl(firstWord)) return;

  if (firstWord.length > 99) return;

  if (firstWord.match(COMMON_PREFIXES)) {
    return;
  }
  
  if (!guild.poem_id) {
    poemChannel.send(firstWord)
      .then((msg) => {
        db.guild.setPoemId(guild.id, msg.id);
      });
  } else {
    let filepath = '';

    poemChannel.messages.fetch(guild.poem_id)
      .then((msg) => {
        // Check time to see if it's time to grab a word
        let messageDate = message.createdAt;
        let poemDate;
        if (msg.editedAt) {
          poemDate = msg.editedAt;
        } else {
          poemDate = msg.createdAt;
        }

        let messageTime = messageDate.getFullYear() + ' ' + messageDate.getMonth() + ' ' + messageDate.getDate();
        let poemTime = poemDate.getFullYear() + ' ' + poemDate.getMonth() + ' ' + poemDate.getDate();

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
              let words = newMsg.content.split(' ');
              if (words.length >= 20) {
                poemChannel.send('You wrote a full doki-poem. Nice!');

                // Creates file name
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
