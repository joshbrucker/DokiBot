const Danbooru = require("danbooru");

const auth = require(__basedir + "/auth.json");
const utils = require(__basedir + "/utils.js");

const booru = new Danbooru(auth.danbooruLogin + ":" + auth.danbooruKey);

let hasNsfwTag = function(tags) {
  tags = new Set(tags);
  return tags.has("-rating:safe") || tags.has("rating:questionable") || tags.has("rating:explicit");
};

let convertToValidTag = async function(tag) {
  let tokenized = tag.split(/_| /);
  let wildcarded = tag.replace(/_| /g, ".*");

  const [ basicSearch, japaneseNameSearch, wildCardAttempt1, wildCardAttempt2 ] = await Promise.all([
    booru.get("/tags", { "search[name]": tag, "search[order]": "count" }),
    (tokenized.length === 2) ? await booru.get("/tags", { "search[name_comma]": tokenized[0] + "_" + tokenized[1]
        + ".*," + tokenized[1] + "_" + tokenized[0] + ".*", "search[order]": "count"}) :  [],
    booru.get("/tags", { "search[name_regex]": wildcarded + ".*", "search[order]": "count" }),
    booru.get("/tags", { "search[name_regex]": ".*" + wildcarded + ".*", "search[order]": "count" }),
  ]);

  if (basicSearch.length > 0 && basicSearch[0] && basicSearch[0]["post_count"] !== 0) {
    return basicSearch[0].name;
  }

  if (japaneseNameSearch.length > 0 && japaneseNameSearch[0]) {
    return japaneseNameSearch[0].name;
  }

  if (wildCardAttempt1.length > 0 && wildCardAttempt1[0]) {
    return wildCardAttempt1[0].name;
  }

  if (wildCardAttempt2.length > 0 && wildCardAttempt2[0]) {
    return wildCardAttempt2[0].name;
  }

  return "n/a";
};

let generateTags = async function(args, girlOrBoy) {
  let tags = new Set(["-comic", "*" + girlOrBoy, "rating:safe"]);
  let customTags = [];

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (arg === "nsfw") {
      tags.add("-rating:safe")
      tags.delete("rating:safe");
    } else if (arg.match(/rating:(explicit|questionable)/)) {
      tags.add(arg);
      tags.delete("rating:safe")
    } else if (arg === "explicit" || arg === "questionable") {
      tags.add("rating:" + arg);
      tags.delete("rating:safe");
    } else if (arg.match(/([1-6]|(6\+))${girlOrBoy}(s)?/)) {
      tags.add(arg);
      tags.delete("*" + girlOrBoy);
    } else if (arg === "gif") {
      tags.add("animated");
    } else if (arg === "sound") {
      tags.add("video_with_sound");
    } else {
      customTags.push(convertToValidTag(arg));
    }
  }

  customTags = await Promise.all(customTags);
  customTags.forEach(customTag => tags.add(customTag));

  return tags;
};

let tagsToReadable = function(title) {
  title = title.split(" ")
  title = title.map(t => t.replace(/_\([^)]*\)/g, "").replace(/_/g, " "));
  title = Array.from(new Set(title));

  if (title.length > 5) {
    title = title.slice(0, 5);
    title.push("...");
  }
  title = title.join(", ")

  // capitalize first letter of words
  return title.replace(
    /\w\S*\W*/g,
    function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    }
  );
};

let getImage = async function(tags) {
  let posts = await booru.posts({ random: true, limit: 20, tags: Array.from(tags).join(" ") });
  return posts[utils.random(posts.length)];
};

module.exports = {
  hasNsfwTag,
  generateTags,
  tagsToReadable,
  getImage
}