// Very powerful function. Bug test thoroughly when adding changes here.
const db = require(__basedir + '/utils/db');
const utils = require(__basedir + '/utils/utils');

let broadcast = function(client, message, args) {
    if (message.author.id == '133805362347376640') {
        let msg = args.join(' ');
        message.channel.send('You are about to send a message to ALL servers DokiBot is on.\n'
                              + 'Type **Confirm** to confirm.')
            .then(() => {
                message.channel.awaitMessages((response) => response.author.id === '133805362347376640', {
                    max: 1,
                    time: 10000,
                    errors: ['time']
                })
                .then((collected) => {
                    let confirm = collected.first();
                    if (confirm.content == 'Confirm') {
                        db.guild.getAllGuildChannels((res) => {
                            for (let response of res) {
                                let guild = client.guilds.get(response.id);
                                let channel = guild.channels.get(response.default_channel);
                                if (!channel) {
                                    channel = utils.getJoinChannel(client, guild);
                                }

                                if (channel) {
                                    channel.send(msg);
                                }
                            }
                        });
                    } else {
                        message.channel.send('You did not say **Confirm**. For safety reasons, cancelling...');
                    }
                    return;
                })
                .catch((err) => {
                    console.log(err);
                    message.channel.send('You did not say **Confirm** in time, or I encountered an error. For safety reasons, cancelling...');
                    return;
                });
            });
    }
};

module.exports = broadcast;