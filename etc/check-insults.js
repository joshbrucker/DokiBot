const fs = require('fs');
const path = require('path');

const utils = require(__basedir + '/utils/utils');
const db = require(__basedir + '/utils/db');

let checkInsults = async function(client) {

    let date = new Date();
    db.getInsultGuildIds(date, (guildIds) => {
        if (guildIds.length == 0) {
            return;
        }

        let insults = fs.readFileSync('./assets/insults.txt').toString().split("\n");
        
        for (let i = 0; i < guildIds.length; i++) {
            // Contingency plan in case bot is down for too long
            if (guildIds.length > 200) {
                db.setInsultTime(guildIds[i].id, generateNewTime(date));
                continue;
            }

            let guild = client.guilds.get(guildIds[i].id);

            if (guild.available) {
                let insult = insults[Math.floor(Math.random() * insults.length)];
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

                let channel = utils.getGeneralChat(guild);
                if (!channel) {
                    channel = utils.getMostPermissibleChannel(client, guild);
                }

                if (channel.type == 'text') {
                    channel.send(insult).then((msg) => {
                        // 1/20 chance of sending advertisement on weekends
                        if (date.getDay() == 6 || date.getDay() == 0) {
                            if (Math.floor(Math.random() * 20)) {
                                channel.send(`Enjoying my beautiful presence? Please drop a like on my page.
                                              It would make me a very happy Doki <3\n
                                              https://discordbots.org/bot/412824514414510080.`);
                            }
                        }
                    });
                }

                db.setInsultTime(guild.id, generateNewTime(date));
            }
        }
    });
};


let generateNewTime = function(date) {
    let newDate = new Date(date);
    let hours = Math.floor(Math.random() * 24);
    let minutes = Math.floor(Math.random() * 64);

    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);

    if (newDate < date) {
        newDate.setDate(newDate.getDate() + 1);
    }

    return newDate;
};

module.exports = checkInsults;