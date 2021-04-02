const fs = require('fs');
const path = require('path');

const utils = require(__basedir + '/utils.js');

var moniquote = function(guild, message, args) {
    fs.readFile(__basedir + '/assets/moniquote.txt', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            var lines = data.toString().split('\n');
            var startIndices = [0];

            for (var i = 0; i < lines.length; i++) {
                if (lines[i].replace(/[\n\r]/g, '') == '' && lines[i + 1] != undefined) {
                    startIndices.push(i + 1);
                }
            }

            var quoteNum = Math.floor(Math.random() * startIndices.length);
            var msg = '\`\`\`ml\n' + lines[startIndices[quoteNum]] + '\n\n\"';

            var i = 1;
            var currLine = lines[startIndices[quoteNum] + i];
            while (currLine && currLine.replace(/[\r\n]/g, '') != '') {
                msg += ' ' + currLine.replace(/["]/g, '').replace(/[\r\n]/g, ' ').replace('[player]', message.member.displayName);
                currLine = lines[startIndices[quoteNum] + ++i];
            }

            msg = msg.slice(0, msg.length - 1);
            msg += '\"\`\`\`';
            message.channel.send(msg);
        }
    });
}

module.exports = moniquote;
