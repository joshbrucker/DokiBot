const auth = require(__basedir + '/auth.json');
const utils = require(__basedir + '/utils.js');
const db = require(__basedir + '/database/db.js');

let submit = function(guild, message, args) {
    const client = message.client;
    const channel = message.channel;
    const user = message.author;

    if (args.length < 1) {
        utils.invalidArgsMsg(message, 'submit');
        return;
    }

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

    let dokibotHub = client.guilds.resolve(auth.dokihubId);
    if (!dokibotHub) {
        console.log('Can\'t get DokiBot Hub server!');
        return;
    }

    let submissionChannel = dokibotHub.channels.resolve(auth.submissionChannelId);
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
                remaining = '**' + Math.ceil(remaining / 3600000) + '**' + ' hours!';
            } else if (Math.ceil(remaining / 60000) > 1) {
                remaining = '**' + Math.ceil(remaining / 60000) + '**' + ' minutes!';
            } else {
                remaining = Math.ceil(remaining / 1000);
                remaining = '**' + remaining + '**' + ((remaining == 1) ? ' second!' : ' seconds!');
            }
            channel.send('You cannot submit an insult for another ' + remaining +
                         ' Vote for DokiBot to reset the timer.');
            return;
        }

        submissionChannel.send(insult + '\n\n' + '**ID:** ' + user.id + '\n' + '**NAME:** ' + user.username)
            .then((msg) => {
                utils.react(msg, ['✅', '❌']);
            });
        channel.send('Your insult was submitted! You will be alerted if it is accepted.');

        date.setDate(date.getDate() + 1);
        db.member.setSubmitCooldown(user.id, date);
    });
};

module.exports = submit;