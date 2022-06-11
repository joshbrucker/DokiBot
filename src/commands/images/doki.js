const fs = require('fs');
const path = require('path');
const Danbooru = require('danbooru');

const auth = require(__basedir + '/auth.json');
const utils = require(__basedir + '/utils.js');

let doki = function(client, guild, message, args) {
  const channel = message.channel;

  if (args.length > 4) {
    channel.send('You can only use up to 4 tags!');
    return;
  }

  let invalid = false;
  args = new Set(args);

  let tags = new Set([]);
  tags.add('doki_doki_literature_club');

  let nsfw = false;
  tags.add('is:sfw');

  args.forEach((arg) => {
    switch(arg) {
      case 'nsfw':
        nsfw = true;
        tags.delete('is:sfw');
        tags.add('is:nsfw');
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
      case 'monika':
        tags.add('monika_(doki_doki_literature_club)');
        break;
      case 'sayori':
        tags.add('sayori_(doki_doki_literature_club)');
        break;
      case 'yuri':
        tags.add('yuri_(doki_doki_literature_club)');
        break;
      case 'natsuki':
        tags.add('natsuki_(doki_doki_literature_club)');
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
    channel.send('Woah now! This text channel isn\'t marked NSFW. I probably shouldn\'t post the steamy stuff here :underage: ');
    return;
  }

  const booru = new Danbooru(auth.danbooruLogin + ':' + auth.danbooruKey);

  booru.posts({ limit: 50, tags: Array.from(tags).join(' ') })
    .then((posts) => {
      const post = posts[utils.random(posts.length)];

      if (post) {
        const url = booru.url(post.file_url);
        const name = `${post.md5}.${post.file_ext}`;

        if (post.tag_string.includes('loli') || post.tag_string.includes('shota')) {
          channel.send('I can\'t post this picture because it\'s tagged with loli/shota.');
        } else {
          channel.send(url.href);
        }
      } else {
        channel.send('Hmmm... I am having trouble grabbing a picture. Please try again.');
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = doki;
