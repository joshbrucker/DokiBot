const Danbooru = require("danbooru");

const auth = require(global.__basedir + "/auth.json");

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
  let baseTag = tag.startsWith("-") ? tag.substring(1) : tag;

  let tokenized = baseTag.split(/_| /);
  let matching = baseTag.replace(/_| /g, "*");
  let wildcarded = baseTag.replace(/_| /g, ".*");

  // [ basicSearch, tagAliases, japaneseNameSearch, wildCardAttempt1, wildCardAttempt2, japaneseWildcarded, tagAliases2 ]
  const searchResults = await Promise.all([
    booru.get("/tags", { "search[name]": baseTag, "search[order]": "count" }),
    booru.get("/tags", { "search[consequent_aliases][antecedent_name]": baseTag, "search[order]": "count" }),
    (tokenized.length === 2) ? await booru.get("/tags", { "search[name_comma]": tokenized[1] + "_" + tokenized[0], "search[order]": "count" }) :  [],
    booru.get("/tags", { "search[name_regex]": wildcarded + ".*", "search[order]": "count" }),
    booru.get("/tags", { "search[name_regex]": ".*" + wildcarded + ".*", "search[order]": "count" }),
    (tokenized.length === 2) ? booru.get("/tags", { "search[name_regex]": tokenized[1] + "_" + tokenized[0] + ".*", "search[order]": "count" }) : [],
    booru.get("/tags", { "search[consequent_aliases][name_matches]": matching + "*", "search[order]": "count" })
  ]);

  let resolvedTag;

  for (let i = 0; i < searchResults.length; i++) {
    let result = searchResults[i];
    if (result.length > 0 && result[0].post_count > 0) {
      resolvedTag = result[0];
      break;
    }
  }

  if (resolvedTag && tag.startsWith("-")) {
    resolvedTag.name = "-" + resolvedTag.name;
  }
    
  return resolvedTag || new InvalidTag(tag);
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
  return await booru.posts({ limit: imageCount, tags: Array.from(tags).join(" ") });
};

module.exports = {
  InvalidTag,
  hasNsfwTag,
  tagsToReadable,
  convertToValidTag,
  getImage
};
