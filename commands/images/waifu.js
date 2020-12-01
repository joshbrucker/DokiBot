const fs = require('fs');
const path = require('path');

const danbooru = require(__basedir + '/helpers/danbooru');
const utils = require(__basedir + '/utils/utils');

let waifu = async function(message, args) {
  const client = message.client;
  const channel = message.channel;

  args = args.join(' ');
  args = args.split('$');
  args.forEach((arg) => {
    return arg.trim();
  });

  if (args.length > 4) {
    channel.send('You can only have up to 4 tags!');
    return;
  }

  const tags = new Set(await danbooru.generateTags(args, 'girl'));
  const isNsfw = danbooru.hasNsfwTag(tags);

  if (tags.has('n/a')) {
    channel.send('Oops, I can\'t find that tag!');
    return;
  }

  if (isNsfw && !channel.nsfw) {
    channel.send('Woah now! This text channel isn\'t marked NSFW. I probably shouldn\'t post the steamy stuff here :underage:');
    return;
  }

  const post = await danbooru.getImage(tags);
  if (post) {
    const name = `${post.md5}.${post.file_ext}`;
    if (isNsfw && (post.tag_string.includes('loli') || post.tag_string.includes('shota'))) {
      channel.send(':x: I can\'t post this because it contains nsfw loli/shota!');
      return;
    }

    character = post.tag_string_character;
    series = post.tag_string_copyright;
    channel.send('Pictured' + ': **' + danbooru.tagToTitle(character) + '**\n'
        + 'From: **' + danbooru.tagToTitle(series) + '**', { files: [post.file_url] });
  } else {
    channel.send(':x: I can\'t find a waifu with those tags!');
  }
};

module.exports = waifu;