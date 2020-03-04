const fs = require('fs');
const path = require('path');

const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

let checkInsults = async function(client) {

    let date = new Date();
    db.guild.getInsultReadyGuilds(date, (readyGuilds) => {
        if (readyGuilds.length == 0) {
            return;
        }

        db.insult.getInsults(readyGuilds.length, (insults) => {
            for (let i = 0; i < readyGuilds.length; i++) {
                // Reset times if too many servers have to send an insult at once
                if (readyGuilds.length > 100) {
                    db.guild.setInsultTime(readyGuilds[i].id, utils.generateNewTime(date));
                    continue;
                }

                let guild = client.guilds.resolve(readyGuilds[i].id);

                if (guild.available) {
                    let insult = insults[i].message;
                    let insultees = insult.match(/%user%/g).length;
                    let members = utils.getMembers(guild);

                    for (let j = 0; j < insultees; j++) {
                        let index = Math.floor(Math.random() * members.length);
                        let insultee = members[index];
                        insult = insult.replace('%user%', '<@' + insultee.id + '>');

                        if (members.length > 1) {
                            members.splice(index, 1);
                        }
                    }

                    let channel = guild.channels.resolve(readyGuilds[i].default_channel);

                    if (channel) {
                        channel.send(insult);
                    } else {
                        channel = utils.getAvailableChannel(client, guild);
                        if (channel) {
                            db.guild.setDefaultChannel(guild.id, channel.id);
                            channel.send('I couldn\'t find your default channel, so I set it to this channel. '
                                    + 'If you want to change where I send messages, use the `setchannel` command!')
                                .then(() => {
                                    channel.send(insult);
                                });
                        }
                    }
                    db.guild.setInsultTime(guild.id, utils.generateNewTime(date));
                }
            }
        });
    });
};

module.exports = checkInsults;