const utils = require(__basedir + '/utils.js');

let dokiReact = function(client, message) {
    let content = message.content.toLowerCase();

    let MONIKA_EMOJI = client.emojis.resolve('413066828290588685');
    let NATSUKI_EMOJI = client.emojis.resolve('413066817561690112');
    let SAYORI_EMOJI = client.emojis.resolve('413066808124243988');
    let YURI_EMOJI = client.emojis.resolve('413066837841018880');

    if (content.search('monika') > -1) {
        utils.react(message, [MONIKA_EMOJI]);
    }
    if (content.search('natsuki') > -1) {
        utils.react(message, [NATSUKI_EMOJI]);
    }
    if (content.search('sayori') > -1) {
        utils.react(message, [SAYORI_EMOJI]);
    }
    if (content.search('yuri') > -1) {
        utils.react(message, [YURI_EMOJI]);
    }
};

module.exports = dokiReact;