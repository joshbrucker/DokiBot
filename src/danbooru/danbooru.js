const Danbooru = require('danbooru');

const auth = require(__basedir + '/auth.json');
const utils = require(__basedir + '/utils.js');

const booru = new Danbooru(auth.danbooruLogin + ':' + auth.danbooruKey);

let hasNsfwTag = function(tags) {
  tags = new Set(tags);
  if (tags.has('-is:sfw') || tags.has("is:nsfw") || tags.has('rating:questionable') || tags.has('rating:explicit')) {
    return true;
  } else {
    return false;
  }
};

let convertToValidTag = async function(tag) {
  let res = await booru.get('/tags', { 'search[name]': tag, 'search[order]': 'count' });
  if (res[0]) {
    return res[0].name;
  }

  let tokenized = tag.split(/_| /);
  if (tokenized.length == 2) {
    let tag1 = tokenized[0] + '_' + tokenized[1];
    let tag2 = tokenized[1] + '_' + tokenized[0];
    res = await booru.get('/tags', { 'search[name_comma]': tag1 + ',' + tag2, 'search[order]': 'count'});
    if (res[0]) {
      return res[0].name;
    }

    res = await booru.get('/tags', { 'search[name_matches]': tag1 + '*', 'search[order]': 'count' });
    if (res[0]) {
      return res[0].name;
    }

    res = await booru.get('/tags', { 'search[name_matches]': tag2 + '*', 'search[order]': 'count' });
    if (res[0]) {
      return res[0].name;
    }
  }

  let wildcard = tag.replace(/_| /g, '*') + '*';
  res = await booru.get('/tags', { 'search[name_matches]': wildcard, 'search[order]': 'count' });
  if (res[0]) {
    return res[0].name;
  }

  res = await booru.get('/tags', { 'search[name_matches]': '*' + wildcard, 'search[order]': 'count'  });
  if (res[0]) {
    return res[0].name;
  }

  return 'n/a';
};

let generateTags = async function(args, girlOrBoy) {
  let tags = new Set(['order:random', '-comic', '*' + girlOrBoy, 'is:sfw']);

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (arg == 'nsfw') {
      tags.add('is:nsfw');
      tags.delete('is:sfw');
    } else if (arg.match(/rating:(explicit|questionable)/)) {
      tags.add(arg);
      tags.delete('is:sfw');
    } else if (arg == 'explicit' || arg == 'questionable') {
      tags.add('rating:' + arg);
      tags.delete('is:sfw');
    } else if (arg.match(/([1-6]|(6\+))${girlOrBoy}(s)?/)) {
      tags.add(arg);
      tags.delete('*' + girlOrBoy);
    } else if (arg == 'gif') {
      tags.add('animated');
    } else if (arg == 'sound') {
      tags.add('video_with_sound');
    } else {
      let tag = await convertToValidTag(arg);
      tags.add(tag);
    }
  }

  return tags;
};

let tagToTitle = function(title) {
  title = title.split(' ');

  if (title.length > 10) {
    title = title.slice(0, 10);
    title.push('...');
  }
  title = title.join(', ').replace(/_/g, ' ').replace(/ *\([^)]*\) */g, '');

  return title.replace(
    /\w\S*\W*/g,
    function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    }
  );
};

let getImage = async function(tags) {
  let posts = await booru.posts({ limit: 20, tags: Array.from(tags).join(' ') });
  return posts[utils.random(posts.length)];
};

module.exports = {
  hasNsfwTag,
  generateTags,
  tagToTitle,
  getImage
}