const utils = require(__basedir + '/utils.js');

let dokiReact = async function(client, message) {
    let content = message.content.toLowerCase();

    if (content.search(/\bmonika\b/) > -1) {
        const monika = await utils.getCustomEmoji(client, '860677947857698847');
        utils.react(message, [monika]);
    }
    if (content.search(/\bnatsuki\b/) > -1) {
        const natsuki = await utils.getCustomEmoji(client, '860678345662267392');
        utils.react(message, [natsuki]);
    }
    if (content.search(/\bsayori\b/) > -1) {
        const sayori = await utils.getCustomEmoji(client, '860677897039773726');
        utils.react(message, [sayori]);
    }
    if (content.search(/\byuri\b/) > -1) {
        const yuri = await utils.getCustomEmoji(client, '860677986226274354');
        utils.react(message, [yuri]);
    }
};

module.exports = dokiReact;