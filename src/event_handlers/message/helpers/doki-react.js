const utils = require(__basedir + "/utils/utils.js");

let dokiReact = async function(client, message) {
    let guild = message.guild;
    let channel = message.channel;
    let content = message.content.toLowerCase();

    if (content.search(/\bmonika\b/) > -1) {
        if (utils.random(10) === 0) {
            const monika = await utils.fetchEmoji(client, guild, channel, "monika");
            if (monika !== "") {
                utils.react(message, [monika]);
            }
        }
    };

    if (content.search(/\bnatsuki\b/) > -1) {
        if (utils.random(10) === 0) {
            const natsuki = await utils.fetchEmoji(client, guild, channel, "natsuki");
            if (natsuki !== "") {
                utils.react(message, [natsuki]);
            }
        }
    }
    if (content.search(/\bsayori\b/) > -1) {
        if (utils.random(10) === 0) {
            const sayori = await utils.fetchEmoji(client, guild, channel, "sayori");
            if (sayori !== "") {
                utils.react(message, [sayori]);
            }
        }
    }
    if (content.search(/\byuri\b/) > -1) {
        if (utils.random(10) === 0) {
            const yuri = await utils.fetchEmoji(client, guild, channel, "yuri");
            if (yuri !== "") {
                utils.react(message, [yuri]);
            }
        }
    }
};

module.exports = dokiReact;