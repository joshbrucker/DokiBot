const voiceTasks = require(__basedir + '/utils/audio/voice-tasks');
const voice = require(__basedir + '/utils/audio/voice');

let queue = function(message, args) {
    const id = message.guild.id;
    const channel = message.channel;
    const server = voiceTasks.getServer(id);
    const task = server.task;
    
    if (task.dispatcher && task.name == voiceTasks.TASK.OST) {
        const pageLength = 10;
        const maxPage = Math.ceil(task.queue.length / pageLength);
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
    } else {
        channel.send('Nothing currently playing!');
    }
};

module.exports = queue;