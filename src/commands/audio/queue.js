const voiceTasks = require(__basedir + "/voice/voice-tasks.js");
const voiceManager = require(__basedir + "/voice/voice-manager.js");

let queue = function(client, guild, message, args) {
  const id = message.guild.id;
  const channel = message.channel;
  const server = voiceManager.getServer(id);
  const task = server.task;
  
  const INVALID_PAGE_MSG = "Invalid queue page.";
  const NOTHING_PLAYING_MSG = "Nothing currently playing!";

  const PAGE_LENGTH = 10;

  if (task instanceof voiceTasks.MusicTask) {
    const maxPage = Math.ceil(task.queue.length / PAGE_LENGTH);

    let generateQueue = function(page) {
      let msg = "\`\`\`ml\nCurrent Queue (Page " + page + " Of " + maxPage + ")\n";
      let startIndex = PAGE_LENGTH * (page - 1);
      let endIndex;

      if (page === maxPage && task.queue.length % PAGE_LENGTH !== 0) {
        endIndex = task.queue.length % PAGE_LENGTH + (maxPage - 1) * PAGE_LENGTH;
      } else {
        endIndex = page * PAGE_LENGTH;
      }

      for (let i = startIndex; i < endIndex; i++) {
        msg += "\n\"" + (i + 1) + ". " + task.queue[i].title + "\"";
      }
      msg += "\`\`\`";

      return msg;
    };

    let generateQueueHead = function() {
      let msg = "\`\`\`ml\nCurrent Queue (Page 1 Of " + maxPage + ")\n";
      for (let i = 0; (i < PAGE_LENGTH) && (i < task.queue.length); i++) {
        msg += "\n\"" + (i + 1) + ". " + task.queue[i].title + "\"";
      }
      msg += "\`\`\`";

      return msg;
    };

    if (args.length === 1) {
      let page = args[0];

      if (page > maxPage) {
        channel.send(INVALID_PAGE_MSG);
      } else {
        channel.send(generateQueue(maxPage, page));
      }
    } else {
      channel.send(generateQueueHead(maxPage));
    }
  } else {
    channel.send(NOTHING_PLAYING_MSG);
  }
};

module.exports = queue;