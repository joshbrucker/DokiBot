const utils = require(__basedir + '/utils/utils');

var dokiReact = function(message, client) {
    
    var content = message.content.toLowerCase();

    if (content.search('monika') > -1) {
        react(message, client.emojis.get('413066828290588685'));
    }
    if (content.search('natsuki') > -1) {
        react(message, client.emojis.get('413066817561690112'));
    }
    if (content.search('sayori') > -1) {
        react(message, client.emojis.get('413066808124243988'));
    }
    if (content.search('yuri') > -1) {
        react(message, client.emojis.get('413066837841018880'));
    }
};

var react = function(message, emoji) {
    message.react(emoji)
        .catch((err) => {
            if (err.message != 'Unknown Message') {
                throw err;
            }
        });
};

module.exports = dokiReact;