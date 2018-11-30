const utils = require(__basedir + '/utils/utils');
const auth = require(__basedir + '/data/auth');
const db = require(__basedir + '/utils/db');

let insult = function(client, message, args) {
    let channel = message.channel;
    let user = message.author;

    if (args.length < 2 || args[0].toLowerCase() != 'submit') {
        utils.invalidArgsMsg(message, 'insult');
        return;
    }

    args.shift();
    let insult = args.join(' ');

    if (!insult.includes('%user%')) {
        channel.send('You need to include at least one `%user%` in your insult where ' +
                     'DokiBot should put someone\'s name!');
        return;
    }

    if (insult.length > 200) {
        channel.send('Your insult is too long! Cut it back a bit.');
        return;
    }

    let dokibotHub = client.guilds.get(auth.dokihubId);
    if (!dokibotHub) {
        console.log('Can\'t get DokiBot Hub server!');
        return;
    }

    let submissionChannel = dokibotHub.channels.get(auth.submissionChannelId);
    if (!submissionChannel) {
        console.log('Can\'t get the insult-submissions channel!');
        return;
    }

    db.member.getMember(user.id, (member) => {
        member = member[0];
        let date = new Date();

        if (member.submit_cooldown != null && member.submit_cooldown > date) {
            let remaining = Math.abs(member.submit_cooldown - date);
            if (Math.ceil(remaining / 3600000) > 1) {
                remaining = Math.ceil(remaining / 3600000) + ' hours!';
            } else if (Math.ceil(remaining / 60000) > 1) {
                remaining = Math.ceil(remaining / 60000) + ' minutes!';
            } else {
                remaining = Math.ceil(remaining / 1000);
                remaining += (remaining == 1) ? ' second!' : ' seconds!';
            }

            channel.send('You cannot submit an insult for another ' + remaining);
            return;
        }

        submissionChannel.send(insult + '\n\n' + '**ID:** ' + user.id + '\n' + '**NAME:** ' + user.username)
            .then((msg) => {
                msg.react('✅')
                    .then(() => {
                        msg.react('❌');
                    });
            });

        channel.send('Your insult was submitted! You will be alerted if it is accepted.');

        date.setDate(date.getDate() + 1);
        db.member.setSubmitCooldown(user.id, date);
    });
};

module.exports = insult;