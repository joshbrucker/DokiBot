const fs = require('fs');
const path = require('path');

const danbooru = require(__basedir + '/danbooru/danbooru.js');
const utils = require(__basedir + '/utils.js');

let husbando = async function(client, guild, message, args) {
  const channel = message.channel;

  args = args.join(' ');
  args = args.split('$');
  args.forEach((arg) => {
    return arg.trim();
  });

  if (args.length > 3) {
    channel.send('You can only have up to 3 tags!');
    return;
  }

  const tags = new Set(await danbooru.generateTags(args, 'boy'));
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
          + 'From: **' + danbooru.tagToTitle(series) + '**', { files: [post.large_file_url] })
        .catch((err) => {
          if (err.message == 'Request entity too large') {
            channel.send('Pictured' + ': **' + danbooru.tagToTitle(character) + '**\n'
              + 'From: **' + danbooru.tagToTitle(series) + '**\n' + post.large_file_url);
          } else {
            throw err;
          }
        });
  } else {
    channel.send(':x: I can\'t find a waifu with those tags!');
  }
};

module.exports = husbando;