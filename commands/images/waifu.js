const fs = require('fs');
const path = require('path');
const Danbooru = require('danbooru');

const auth = require(__basedir + '/data/auth');
const utils = require(__basedir + '/utils/utils');

let waifu = function(client, message, args) {

    const channel = message.channel;

    fs.readFile('./assets/waifus.txt', (err, data) => {
        let lines = data.toString().split('\n');
        let lineNum = utils.random(lines.length);
        let waifuName = lines[lineNum];

        if (args.length > 5) {
            channel.send('You can only use up to 5 tags!');
            return;
        }

        let invalid = false;
        args = new Set(args);

        let tags = new Set([]);
        tags.add(waifuName);

        let nsfw = false;
        tags.add('rating:safe');

        args.forEach((arg) => {
            switch(arg) {
                case 'nsfw':
                    nsfw = true;
                    tags.delete('rating:safe');
                    tags.add('-rating:safe');
                    break;
                case '1girl':
                    tags.add('1girl');
                    break;
                case '2girls':
                    tags.add('2girls');
                    break;
                case 'multiple':
                    tags.add('multiple_girls');
                    break;
                default:
                    invalid = true;
            }
        })

        if (invalid) {
            channel.send('Invalid tag(s)!');
            return;
        }

        if (nsfw && !channel.nsfw) {
            let emoji = client.emojis.get('534525159676182539');
            channel.send("Woah now! This text channel isn't marked NSFW. I probably shouldn't post the steamy stuff here " + emoji);
            return;
        }

        const booru = new Danbooru(auth.danbooruLogin + ':' + auth.danbooruKey);

        booru.posts({ random: true, limit: 50, tags: Array.from(tags).join(' ') })
            .then((posts) => {
                const post = posts[utils.random(posts.length)];

                if (post) {
                    const url = booru.url(post.file_url);
                    const name = `${post.md5}.${post.file_ext}`;

                    if (post.tag_string.includes('loli') || post.tag_string.includes('shota')) {
                        channel.send('I can\'t post this picture because it\'s tagged with loli/shota.');
                    } else {
                        channel.send('Waifu: **' + utils.toTitleCase(waifuName) + '**\n'
                            + 'From: **' + utils.toTitleCase(post.tag_string_copyright) + '**\n'
                            + url.href);
                    }
                } else {
                    channel.send('Hmmm... I am having trouble grabbing a picture. Please try again.');
                }
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

module.exports = waifu;