const ostUtils = require(__basedir + '/utils/audio/ost-utils');

let queue = function(message, args) {
    let id = message.guild.id;
    let channel = message.channel;

    ostUtils.runVoiceCmd(id, channel, async (server, task) => {
        const pageLength = 10;
        let maxPage = Math.ceil(task.queue.length / pageLength);
        let msg;

        if (args.length == 1) {
            let page = args[0];

            if (page > maxPage) {
                channel.send('Invalid queue page.');
            } else {
                msg = '\`\`\`ml\nCurrent Queue (Page ' + page + ' Of ' + maxPage + ')\n';

                let startIndex = pageLength * (page - 1);

                let endIndex;
                if (page == maxPage && task.queue.length % pageLength != 0) {
                    endIndex = task.queue.length % pageLength + (maxPage - 1) * pageLength;
                } else {
                    endIndex = page * pageLength;
                }

                for (let i = startIndex; i < endIndex; i++) {
                    msg += '\n\"' + (i + 1) + '. ' + task.queue[i].name + '\"';
                }
                msg += '\`\`\`';
                channel.send(msg);
            }
        } else {
            msg = '\`\`\`ml\nCurrent Queue (Page 1 Of ' + maxPage + ')\n';
            for (let i = 0; (i < pageLength) && (i < task.queue.length); i++) {
                msg += '\n\"' + (i + 1) + '. ' + task.queue[i].name + '\"';
            }
            msg += '\`\`\`';
            channel.send(msg);
        }
    });
};

module.exports = queue;