const soundtrack = require(__basedir + '/assets/soundtrack.json');

let list = function(message, args) {
  const channel = message.channel;

  let msg = '```ml\nDoki Doki Literature Club OST\n';
  for (let i = 0; i < soundtrack.length; i++) {
    msg += '\n\"' + (i + 1) + '. ' + soundtrack[i].name + '\"';
  }
  msg += '\`\`\`';
  channel.send(msg);
}

module.exports = list;