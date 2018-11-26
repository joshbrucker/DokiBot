const utils = require(__basedir + '/utils/utils');

var dokiReact = function(message, client) {
    
    const dokiHub = client.guilds.get('413064571075559425');
    var content = message.content.toLowerCase();

    if (dokiHub.available) {
        if (content.search('monika') > -1) {
            react(message, dokiHub, 'monika_head');
        }
        if (content.search('natsuki') > -1) {
            react(message, dokiHub, 'natsuki_head');
        }
        if (content.search('sayori') > -1) {
            react(message, dokiHub, 'sayori_head');
        }
        if (content.search('yuri') > -1) {
            react(message, dokiHub, 'yuri_head');
        }
    }
};

var react = function(message, emojiHub, emojiName) {
    const emoji = emojiHub.emojis.find((emoji) => emoji.name === emojiName);
    message.react(emoji)
        .catch((err) => {
            if (err.message != 'Unknown Message') {
                console.log(err);
            }
        });
};

module.exports = dokiReact;