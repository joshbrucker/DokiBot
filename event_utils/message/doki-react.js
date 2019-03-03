const utils = require(__basedir + '/utils/utils');

let dokiReact = function(message, client) {
    let content = message.content.toLowerCase();

    if (content.search('monika') > -1) {
        utils.react(message, [client.emojis.get('413066828290588685')]);
    }
    if (content.search('natsuki') > -1) {
        utils.react(message, [client.emojis.get('413066817561690112')]);
    }
    if (content.search('sayori') > -1) {
        utils.react(message, [client.emojis.get('413066808124243988')]);
    }
    if (content.search('yuri') > -1) {
        utils.react(message, [client.emojis.get('413066837841018880')]);
    }
};

module.exports = dokiReact;