const Discord = require('discord.js');

const anilist = require(__basedir + '/anilist/anilist.js');
const utils = require(__basedir + '/utils.js');

let anime = async function(guild, message, args) {
  let channel = message.channel;

  let title = args.join(' ');
  let variables = { search: title };
  let query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
      }
    }
  `;

  let res = await anilist.query(query, variables);
  if (res.ok) {
    let json = await res.json();
    let data = json.data.Media;
    channel.send('https://anilist.co/anime/' + data.id);
  } else if (res.status == 404) {
    channel.send('I can\'t find that anime!');
  } else {
    channel.send('I\'m having some issues reaching Anilist. Is it down?');
    console.log('Anilist request status:' + res.status);
  }
}

module.exports = anime;