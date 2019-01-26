const fs = require('fs');
const path = require('path');

const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

let checkInsults = async function(client) {

    let date = new Date();
    db.guild.getInsultReadyGuilds(date, (guildIds) => {
        if (guildIds.length == 0) {
            return;
        }

        db.insult.getInsults(guildIds.length, async (insults) => {
            for (let i = 0; i < guildIds.length; i++) {
                // Contingency plan in case bot is down for too long
                if (guildIds.length > 200) {
                    db.guild.setInsultTime(guildIds[i].id, utils.generateNewTime(date));
                    continue;
                }

                let guild = client.guilds.get(guildIds[i].id);

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

                    if (insults[i].user) {
                        var user = await client.fetchUser(insults[i].user);
                        if (user) {
                            insult += '\n\n**Submitted by:** ' + user.username;
                        }
                    }

                    let channel = utils.getGeneralChat(guild);
                    if (!channel) {
                        channel = utils.getMostPermissibleChannel(client, guild);
                    }

                    if (channel.type == 'text') {
                        channel.send(insult).then((msg) => {
                            // 1/30 chance of sending advertisement on weekends
                            if (date.getDay() == 6 || date.getDay() == 0) {
                                if (Math.floor(Math.random() * 30) == 0) {
                                    channel.send('Enjoying my beautiful presence? Please drop a like on my page. ' +
                                                  'It would make me a very happy Doki <3\n' +
                                                  'https://discordbots.org/bot/412824514414510080.');
                                }
                            }
                        });
                    }

                    db.guild.setInsultTime(guild.id, utils.generateNewTime(date));
                }
            }
        });
    });
};

module.exports = checkInsults;