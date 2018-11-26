// Very powerful function. Bug test thoroughly when adding changes here.
const utils = require(__basedir + '/utils/utils');

var broadcast = function(message, args, client) {
    if (message.author.id == '133805362347376640') {
        var msg = args.join(' ');
        message.channel.send('You are about to send a message to ALL servers DokiBot is on.\n'
                              + 'Type **Confirm** to confirm.')
            .then(() => {
                message.channel.awaitMessages((response) => response.author.id === '133805362347376640', {
                    max: 1,
                    time: 10000,
                    errors: ['time']
                })
                .then((collected) => {
                    var confirm = collected.first();
                    if (confirm.content == 'Confirm') {
                        for (let guild of client.guilds.array()) {
                            if (guild.available) {
                                var channel = utils.getGeneralChat(guild);
                                if (!channel) {
                                    channel = utils.getMostPermissibleChannel(client, guild);
                                }

                                if (channel.type == 'text') {
                                    channel.send(msg);
                                }
                            }
                        }
                    } else {
                        message.channel.send('You did not say **Confirm**. For safety reasons, cancelling...');
                    }
                    return;
                })
                .catch((err) => {
                    message.channel.send('You did not say **Confirm**. For safety reasons, cancelling...');
                });
            });
    }
};

module.exports = broadcast;