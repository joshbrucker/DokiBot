const fs = require('fs');
const path = require('path');
const Danbooru = require('danbooru');
const winston = require('winston');

const auth = require(__basedir + '/data/auth');
const utils = require(__basedir + '/utils/utils');

const characters = require(__basedir + '/assets/characters.json');
const sample = utils.aliasSampler(characters.map((entry) => entry.girls.length));

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'logs/failedwaifus.log' })
    ]
});

let waifu = function(message, args) {
    const client = message.client;
    const channel = message.channel;

    if (args.length > 4) {
        channel.send('You can only have up to 4 tags!');
        return;
    }

    let series;
    let character;

    let tags = new Set([]);

    // Default tags
    tags.add('1girl');
    tags.add('-comic');
    tags.add('rating:safe');

    // Tag conditions
    let nsfw = false;
    let multiple = false;
    let custom = false;

    args = new Set(args);
    args.forEach((arg) => {
        switch(arg) {
            case 'nsfw':
                nsfw = true;
                tags.delete('rating:safe');
                tags.add('-rating:safe');
                break;
            case 'multiple':
                multiple = true;
                tags.delete('1girl');
                tags.add('multiple_girls');
                break;
            default:
                custom = true;
                tags.delete(character);
                tags.add(arg);

                if (arg == 'comic') {
                    tags.delete('-comic');
                }
        }
    });

    if (!custom) {
        series = characters[sample()];
        character = series.girls[utils.random(series.girls.length)];
        tags.add(character);
    }

    if (nsfw && !channel.nsfw) {
        let emoji = client.emojis.get('534525159676182539');
        channel.send('Woah now! This text channel isn\'t marked NSFW. I probably shouldn\'t post the steamy stuff here ' + emoji.toString());
        return;
    }

    const booru = new Danbooru(auth.danbooruLogin + ':' + auth.danbooruKey);

    (function postImage() {
        booru.posts({ random: true, limit: 20, tags: Array.from(tags).join(' ') })
            .then((posts) => {
                const post = posts[utils.random(posts.length)];

                if (post) {
                    const url = booru.url(post.file_url);
                    const name = `${post.md5}.${post.file_ext}`;

                    if (tags.has('-rating:safe') && (post.tag_string.includes('loli') || post.tag_string.includes('shota'))) {
                        // Finds an image of a different character
                        if (custom) {
                            channel.send(':x: I can\'t post this because it is tagged with loli/shota!');
                        } else {
                            tags.delete(character);
                            series = characters[sample()];
                            character = series.girls[utils.random(series.girls.length)];
                            tags.add(character);

                            postImage();
                        }
                    } else {
                        character = post.tag_string_character;
                        series = post.tag_string_copyright;
                        channel.send('Pictured' + ': **' + utils.tagToTitle(character) + '**\n'
                            + 'From: **' + utils.tagToTitle(series) + '**\n'
                            + url.href);
                    }
                } else if (custom) {
                    channel.send(':x: I can\'t find a waifu with those tags!');
                } else {
                    // Logs characters who don't show up with just their names + series
                    if (!tags.has('-rating:safe') && !tags.has('multiple_girls')) {
                        logger.info('Couldn\'t post a safe pic of ' + character);
                    }

                    // Finds an image of a different character
                    tags.delete(character);
                    series = characters[sample()];
                    character = series.girls[utils.random(series.girls.length)];
                    tags.add(character);

                    postImage();
                }
            })
            .catch((err) => {
                console.log(err);
            });
    })();

};

module.exports = waifu;