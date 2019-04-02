const https = require('https');

const utils = require(__basedir + '/utils/utils');

let neko = function(message, args) {
    const id = message.guild.id;
    const client = message.client;
    const channel = message.channel;

    let tag = 'neko';

    if (args.length > 2) {
        channel.send('You can only use 2 possible tags with the -neko command (nsfw, gif)');
        return;
    }

    for (let i = 0; i < args.length; i++) {
        if (args[i] == 'nsfw') {
            tag = (tag == 'ngif' ? 'nsfw_neko_gif' : 'lewd');
        } else if (args[i] == 'gif') {
            tag = (tag == 'lewd' ? 'nsfw_neko_gif' : 'ngif');
        } else {
            channel.send(args[i] + ' is an invalid tag!');
            return;
        }
    }

    if (tag == 'nsfw_neko_gif' || tag == 'lewd') {
        if (!channel.nsfw) {
            let emoji = client.emojis.get('534525159676182539');
            channel.send('I know you like lewd nekos, but you have to use a NSFW channel ' + emoji.toString());
            return;
        }
    }

    https.get('https://nekos.life/api/v2/img/' + tag, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            data = JSON.parse(data);
            channel.send(data['url']);
        });
    })
    .on('error', (err) => {
        console.log('HTTPS Error: ' + err.message);
    });
}

module.exports = neko;