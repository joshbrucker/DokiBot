const Danbooru = require("danbooru");

const auth = require(__basedir + "/auth.json");
const utils = require(__basedir + "/utils.js");

const booru = new Danbooru(auth.danbooruLogin + ":" + auth.danbooruKey);

class InvalidTag {
  constructor(tag) {
    this.tag = tag;
  }
}

let hasNsfwTag = function(tags) {
  tags = new Set(tags);
  return tags.has("-rating:safe") || tags.has("rating:questionable") || tags.has("rating:explicit");
};

let convertToValidTag = async function(tag) {
  let tokenized = tag.split(/_| /);
  let wildcarded = tag.replace(/_| /g, ".*");

  const [ basicSearch, japaneseNameSearch, wildCardAttempt1, wildCardAttempt2, japaneseWildcarded ] = await Promise.all([
    booru.get("/tags", { "search[name]": tag, "search[order]": "count" }),
    (tokenized.length === 2) ? await booru.get("/tags", { "search[name_comma]": tokenized[1] + "_" + tokenized[0], "search[order]": "count"}) :  [],
    booru.get("/tags", { "search[name_regex]": wildcarded + ".*", "search[order]": "count" }),
    booru.get("/tags", { "search[name_regex]": ".*" + wildcarded + ".*", "search[order]": "count" }),
    booru.get("/tags", { "search[name_regex]": ".*" + wildcarded + ".*", "search[order]": "count" }),
    booru.get("/tags", { "search[name_regex]": tokenized[1] + "_" + tokenized[0] + ".*", "search[order]": "count" })
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

  if (japaneseWildcarded.length > 0 && japaneseWildcarded[0]) {
    return japaneseWildcarded[0].name;
  }

  return new InvalidTag(tag);
};

let generateTags = async function(tags, girlOrBoy) {
  let finalTags = new Set(["-comic", "*" + girlOrBoy, "rating:safe"]);
  let customTags = [];

  tags.forEach(t => {
    if (t === "nsfw") {
      finalTags.add("-rating:safe")
      finalTags.delete("rating:safe");
    } else if (t.match(/rating:(explicit|questionable)/)) {
      finalTags.add(t);
      finalTags.delete("rating:safe")
    } else if (t === "explicit" || t === "questionable") {
      finalTags.add("rating:" + t);
      finalTags.delete("rating:safe");
    } else if (t === "comic") {
      finalTags.add("comic");
      finalTags.delete("-comic");
    } else if (t.match(/([1-6]|(6\+))${girlOrBoy}(s)?/)) {
      finalTags.add(t);
      finalTags.delete("*" + girlOrBoy);
    } else if (t === "gif" || t === "video") {
      finalTags.add("animated");
    } else if (t === "sound" || t === "audio") {
      finalTags.add("video_with_sound");
    } else {
      customTags.push(convertToValidTag(t));
    }
  });

  // gather all custom tags and add them to the final list
  (await Promise.all(customTags)).forEach(t => finalTags.add(t));

  return finalTags;
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
  let posts = await booru.posts({ random: true, limit: 1, tags: Array.from(tags).join(" ") });
  return posts[utils.random(posts.length)];
};

module.exports = {
  InvalidTag,
  hasNsfwTag,
  generateTags,
  tagsToReadable,
  getImage
}