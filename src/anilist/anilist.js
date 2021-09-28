const fetch = require("node-fetch");

let query = async function(query, variables) {
  let url = "https://graphql.anilist.co";
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  };

  res = await fetch(url, options);
  return res;
}

module.exports = { query }