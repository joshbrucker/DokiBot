const utils = require(__basedir + '/utils/utils');

var dokiReact = function(message, client) {
    
    var content = message.content.toLowerCase();

    if (content.search('monika') > -1) {
        const monika_head = client.emojis.find((emoji) => emoji.name === 'monika_head');
        message.react(monika_head);
    }
    if (content.search('natsuki') > -1) {
        const natsuki_head = client.emojis.find((emoji) => emoji.name === 'natsuki_head');
        message.react(natsuki_head);
    }
    if (content.search('sayori') > -1) {
        const sayori_head = client.emojis.find((emoji) => emoji.name === 'sayori_head');
        message.react(sayori_head);
    }
    if (content.search('yuri') > -1) {
        const yuri_head = client.emojis.find((emoji) => emoji.name === 'yuri_head');
        message.react(yuri_head);
    }
}

module.exports = dokiReact;
