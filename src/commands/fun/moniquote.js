const fs = require("fs");

let moniquote = async function(client, guild, message, args) {
  let text = await fs.promises.readFile(__basedir + "/resources/moniquote.txt");

  let lines = text.toString().split('\n');
  let startIndices = [0];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].replace(/[\n\r]/g, "") === "" && lines[i + 1] !== undefined) {
      startIndices.push(i + 1);
    }
  }

  let quoteNum = Math.floor(Math.random() * startIndices.length);
  let msg = "\`\`\`ml\n" + lines[startIndices[quoteNum]] + "\n\n\"";

  let i = 1;
  let currLine = lines[startIndices[quoteNum] + i];
  while (currLine && currLine.replace(/[\r\n]/g, "") !== "") {
    msg += ' ' + currLine.replace(/["]/g, "").replace(/[\r\n]/g, ' ').replace("[player]", message.member.displayName);
    currLine = lines[startIndices[quoteNum] + ++i];
  }

  msg = msg.slice(0, msg.length - 1);
  msg += "\"\`\`\`";
  message.channel.send(msg); 
}

module.exports = moniquote;
