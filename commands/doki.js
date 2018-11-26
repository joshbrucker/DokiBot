const fs = require('fs');
const path = require('path');
const Danbooru = require('danbooru');

const utils = require(__basedir + '/utils/utils.js');

var doki = function(message, args) {

    const channel = message.channel;
    const suffix = '_(doki_doki_literature_club)';
    const nsfwType = Math.floor(Math.random() * 2);

    var character;
    var rating = 'safe';

    if (args.length == 0) {
        character = getRandomDoki();
    } else if (args.length == 1) {
        if (args[0] == 'nsfw') {
            rating = ((nsfwType == 0) ? 'questionable' : 'explicit');
            character = getRandomDoki();
        } else {
            character = args[0];
        }
    } else if (args.length == 2) {
        if (args[0] != 'nsfw') {
            utils.invalidArgsMsg(message, 'doki');
            return;
        } else {
            rating = ((nsfwType == 0) ? 'questionable' : 'explicit');
            character = args[1];
        }
    }

    if (character != 'monika' && character != 'sayori' && character != 'yuri' 
        && character != 'natsuki') {

        utils.invalidArgsMsg(message, 'doki');
        return;
    }

    if ((rating == 'questionable' || rating == 'explicit') && !channel.nsfw) {
        channel.send("Woah now! This text channel isn't marked NSFW. I probably shouldn't post the steamy stuff here.");
        return;
    }

    const booru = new Danbooru();

    booru.posts({ random: true, limit: 20, tags: 'rating:' + rating + ' '
        + (character + suffix) + ' ' + ((rating == 'safe') ? '1girl' : '') })

        .then((posts) => {
            const index = Math.floor(Math.random() * posts.length);
            const post = posts[index];

            if (post) {
                const url = booru.url(post.file_url);
                const name = `${post.md5}.${post.file_ext}`;

                channel.send(url.href);
            } else {
                channel.send('Hmmm... I am having trouble grabbing a picture. Please try again.');
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

var getRandomDoki = function() {
    switch(Math.floor(Math.random() * 4)) {
        case 0:
            return 'monika';
        case 1:
            return 'sayori';
        case 2:
            return 'yuri';
        case 3:
            return 'natsuki';
    }
}

module.exports = doki;
