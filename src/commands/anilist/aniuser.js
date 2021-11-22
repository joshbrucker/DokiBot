const anilist = require(__basedir + "/external_services/anilist/anilist.js");

let aniuser = async function(client, guild, message, args) {
  let channel = message.channel;

  let name = args.join(' ');
  let variables = { search: name };
  let query = `
    query ($search: String) {
      User (search: $search) {
        id
      }
    }
  `;

  let res = await anilist.query(query, variables);
  if (res.ok) {
    let json = await res.json();
    let data = json.data.User;
    channel.send("https://anilist.co/user/" + data.id);
  } else if (res.status === 404) {
    channel.send("I can't find that user!");
  } else {
    channel.send("I'm having some issues reaching Anilist. Is it down?");
    console.log("Anilist request status:" + res.status);
  }
}

module.exports = aniuser;