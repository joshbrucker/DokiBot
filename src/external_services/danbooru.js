const auth = require(global.__basedir + "/auth.json");
const { fetch } = require(global.__basedir + "/utils/utils.js");

class InvalidTag {
  constructor(tag) {
    this.tag = tag;
  }
}

let callDanbooruApi = async function(endpoint, params) {
  let link = `https://danbooru.donmai.us/${endpoint}.json?login=${auth.danbooruLogin}&api_key=${auth.danbooruKey}`;
  for (let [key, value] of Object.entries(params)) {
    link += `&${key}=${value}`;
  }

  let res = await fetch(link);

  return JSON.parse(await res.text());
}

let hasNsfwTag = function(tags) {
  tags = new Set(tags);
  return tags.has("-rating:safe") || tags.has("rating:questionable") || tags.has("rating:explicit");
};

let convertToValidTag = async function(tag) {
  let baseTag = tag.startsWith("-") ? tag.substring(1) : tag;
  let tokenized = baseTag.split(/ /g);
  let matching = baseTag.replace(/_| /g, "*");
  let regex = baseTag.replace(/_| /g, ".*");

  // The below code attempts to resolve a tag in a way that tries to
  // be as fast as possible while also respecting the number of calls
  // made to Danbooru - always changing and improving

  let searchResults = [];

  if (tokenized.length === 1) {
    searchResults = await Promise.all([
      callDanbooruApi("tags", { "search[name]": baseTag, "search[hide_empty]": "true", "search[order]": "count" }),
      callDanbooruApi("tags", { "search[consequent_aliases][antecedent_name]": baseTag, "search[hide_empty]": "true", "search[order]": "count" }),
      callDanbooruApi("tags", { "search[name_regex]": ".*" + regex + ".*", "search[hide_empty]": "true", "search[order]": "count" })
    ]);
  } else if (tokenized.length === 2) {
    let initialOrder = tokenized[0] + "_" + tokenized[1];
    let flippedOrder = tokenized[1] + "_" + tokenized[0];

    searchResults = await Promise.all([
      callDanbooruApi("tags", { "search[name_comma]": initialOrder, "search[hide_empty]": "true", "search[order]": "count" }),
      callDanbooruApi("tags", { "search[name_comma]": flippedOrder, "search[hide_empty]": "true", "search[order]": "count" }),
      callDanbooruApi("tags", { "search[name_regex]": initialOrder + ".*", "search[hide_empty]": "true", "search[order]": "count" }),
      callDanbooruApi("tags", { "search[name_regex]": flippedOrder + ".*", "search[hide_empty]": "true", "search[order]": "count" }),
      callDanbooruApi("tags", { "search[name_regex]": ".*" + regex + ".*", "search[hide_empty]": "true", "search[order]": "count" })
    ]);
  } else if (tokenized.length > 2) {
    let initialRegex = tokenized[0] + "_" + tokenized[1] + ".*" + tokenized.slice(2).join(".*") + ".*";
    let flippedRegex = tokenized[1] + "_" + tokenized[0] + ".*" + tokenized.slice(2).join(".*") + ".*";

    searchResults = await Promise.all([
      callDanbooruApi("tags", { "search[name_regex]": initialRegex, "search[hide_empty]": "true", "search[order]": "count" }),
      callDanbooruApi("tags", { "search[name_regex]": flippedRegex, "search[hide_empty]": "true", "search[order]": "count" }),
      callDanbooruApi("tags", { "search[name_regex]": ".*" + regex + ".*", "search[hide_empty]": "true", "search[order]": "count" })
    ]);

  }

  // Matching alias - final attempt in rare cases
  if (searchResults.every(arr => arr.length === 0)) {
    searchResults = await Promise.all([
      callDanbooruApi("tags", { "search[consequent_aliases][name_matches]": matching + "*", "search[hide_empty]": "true", "search[order]": "count" })
    ]);
  }

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
  return await callDanbooruApi("posts", { limit: imageCount, tags: Array.from(tags).join(" ") });
};

module.exports = {
  InvalidTag,
  hasNsfwTag,
  tagsToReadable,
  convertToValidTag,
  getImage
};
