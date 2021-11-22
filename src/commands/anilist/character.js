const anilist = require(__basedir + "/external_services/anilist/anilist.js");

let character = async function(client, guild, message, args) {
  let channel = message.channel;

  let title = args.join(' ');
  let variables = { search: title };
  let query = `
    query ($search: String) {
      Character (search: $search) {
        id
      }
    }
  `;

  let res = await anilist.query(query, variables);
  if (res.ok) {
    let json = await res.json();
    let data = json.data.Character;
    channel.send("https://anilist.co/character/" + data.id);
  } else if (res.status === 404) {
    channel.send("I can't find that character!");
  } else {
    channel.send("I'm having some issues reaching Anilist. Is it down?");
    console.log("Anilist request status:" + res.status);
  }
}

module.exports = character;