// Very powerful function. Bug test thoroughly when adding changes here.
const db = require(__basedir + "/database/db.js");
const utils = require(__basedir + "/utils/utils.js");

let broadcast = function(client, guild, message, args) {
    const channel = message.channel;

    if (message.author.id === "133805362347376640") {
        let msg = args.join(" ");
        channel.send("You are about to send a message to ALL servers DokiBot is on.\nType **Confirm** to confirm.")
            .then(() => {
                channel.awaitMessages((response) => response.author.id === "133805362347376640", {
                    max: 1,
                    time: 10000,
                    errors: ["time"]
                })
                .then((collected) => {
                    let confirm = collected.first();
                    if (confirm.content === "Confirm") {
                        db.guild.getAllGuildChannels((res) => {
                            for (let response of res) {
                                let guild = client.guilds.resolve(response.id);
                                let mainChannel = guild.channels.resolve(response.default_channel);
                                if (!mainChannel) {
                                    mainChannel = utils.getJoinChannel(client, guild);
                                }

                                if (mainChannel) {
                                    mainChannel.send(msg);
                                }
                            }
                        });
                    } else {
                        channel.send("You did not say **Confirm**. For safety reasons, cancelling...");
                    }
                })
                .catch((err) => {
                    console.log(err);
                    channel.send("You did not say **Confirm** in time, or I encountered an error. For safety reasons, cancelling...");
                });
            });
    }
};

module.exports = broadcast;