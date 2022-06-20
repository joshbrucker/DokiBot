const Danbooru = require("danbooru");

const auth = require(__basedir + "/auth.json");

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
  let matching = tag.replace(/_| /g, "*");
  let wildcarded = tag.replace(/_| /g, ".*");

  const [ basicSearch, tagAliases, japaneseNameSearch, wildCardAttempt1, wildCardAttempt2, japaneseWildcarded, tagAliases2 ] = await Promise.all([
    booru.get("/tags", { "search[name]": tag, "search[order]": "count" }),
    booru.get("/tags", { "search[consequent_aliases][antecedent_name]": tag, "search[order]": "count" }),
    (tokenized.length === 2) ? await booru.get("/tags", { "search[name_comma]": tokenized[1] + "_" + tokenized[0], "search[order]": "count"}) :  [],
    booru.get("/tags", { "search[name_regex]": wildcarded + ".*", "search[order]": "count" }),
    booru.get("/tags", { "search[name_regex]": ".*" + wildcarded + ".*", "search[order]": "count" }),
    (tokenized.length === 2) ? booru.get("/tags", { "search[name_regex]": tokenized[1] + "_" + tokenized[0] + ".*", "search[order]": "count" }) : [],
    booru.get("/tags", { "search[consequent_aliases][name_matches]": matching + "*", "search[order]": "count" })
  ]);

  if (basicSearch.length > 0 && basicSearch[0].post_count > 0) {
    return basicSearch[0];
  }
  else if (tagAliases.length > 0) {
    return tagAliases[0];
  }
  else if (japaneseNameSearch.length > 0 && japaneseNameSearch[0].post_count > 0) {
    return japaneseNameSearch[0];
  }
  else if (wildCardAttempt1.length > 0 && wildCardAttempt1[0].post_count > 0) {
    return wildCardAttempt1[0];
  }
  else if (wildCardAttempt2.length > 0 && wildCardAttempt2[0].post_count > 0) {
    return wildCardAttempt2[0];
  }
  else if (japaneseWildcarded.length > 0 && japaneseWildcarded[0].post_count > 0) {
    return japaneseWildcarded[0];
  }
  else if (tagAliases2.length > 0) {
    return tagAliases2[0];
  }

  return new InvalidTag(tag);
};

let tagsToReadable = function(title) {
  title = title.split(" ");
  title = title.map(t => t.replace(/_\([^)]*\)/g, "").replace(/_/g, " "));
  title = Array.from(new Set(title));

  if (title.length > 5) {
    title = title.slice(0, 5);
    title.push("...");
  }
  title = title.join(", ");

  // capitalize first letter of words
  return title.replace(
    /\w\S*\W*/g,
    function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    }
  );
};

let getImage = async function(tags, imageCount) {
  return await booru.posts({limit: imageCount, tags: Array.from(tags).join(" ")});
};

module.exports = {
  InvalidTag,
  hasNsfwTag,
  tagsToReadable,
  convertToValidTag,
  getImage
};
