global.__basedir = __dirname;

const Discord = require('discord.js');

const fs = require('fs');
const path = require('path');
const auth = require('./data/auth');
const db = require('./utils/db');
const utils = require('./utils/utils');
const voiceManager = require('./helpers/voice/voice-manager');
const voiceTasks = require('./helpers/voice/voice-tasks');
const checkInsults = require('./event_utils/client_ready/check-insults');
const setActivity = require('./event_utils/client_ready/set-activity');
const dokiReact = require('./event_utils/message/doki-react');
const executeCmd = require('./event_utils/message/execute-cmd');
const poemUpdate = require('./event_utils/message/poem-update');
const confirmInsult = require('./event_utils/react/confirm-insult');
const setupDbl = require('./helpers/discord_bot_list/setup-dbl');

const client = new Discord.Client();

setupDbl(auth, client);

process.on('unhandledRejection', (reason, p) => {
  if (reason.message != 'Missing Access' && reason.message != 'Missing Permissions') {
    console.log(reason);
  }
});

process.on('uncaughtException', (err) => {
  console.log(err);
});

client.on('error', (err) => {
  console.log(err);
});

process.on('SIGINT', (code) => {
  voiceManager.disconnectAll(client);
  process.exit();
});

client.on('ready', () => {
  db.guild.verifyGuilds(client, (addedGuilds) => {
    for (let i = 0; i < addedGuilds.length; i++) {
      let defaultChannel = utils.getAvailableChannel(client, addedGuilds[i]);
      if (defaultChannel) {
        utils.sendWelcomeMsg(client, addedGuilds[i], defaultChannel);
        db.guild.setDefaultChannel(addedGuilds[i].id, defaultChannel.id);
      }
    }

    setInterval(() => {
      checkInsults(client);
    }, 60000);
  });

  setActivity(client);
  setInterval(() => {
    setActivity(client);
  }, 3600000);

  client.guilds.resolve(auth.dokihubId).channels.resolve(auth.submissionChannelId).messages.fetch();
  setInterval(() => {
    client.guilds.resolve(auth.dokihubId).channels.resolve(auth.submissionChannelId).messages.fetch();
  }, 600000);

  console.log('I am ready!');
});

client.on('guildCreate', (guild) => {
  db.guild.addGuild(guild.id, () => {
    let defaultChannel = utils.getAvailableChannel(client, guild);
    if (defaultChannel) {
      utils.sendWelcomeMsg(client, guild, defaultChannel);
      db.guild.setDefaultChannel(guild.id, defaultChannel.id);
    }
  });
});

client.on('guildDelete', (guild) => {
  db.guild.removeGuild(guild.id);
  voiceTasks.removeServer(guild.id);
});

client.on('message', (message) => {
  if (message.guild && !message.author.bot) {
    db.guild.getGuild(message.guild.id, (guild) => {
      guild = guild[0];
      let prefix = guild.prefix;
      let content = message.content;

      if (content.substring(0, prefix.length) == prefix && content.length > 1) {
        if (message.channel.name != 'doki-poems') {
          let args = content.substring(prefix.length).split(' ');
          let cmd = args[0].toLowerCase();
          args = args.splice(1);

          executeCmd(guild, message, args, cmd);
        }
      }

      poemUpdate(client, guild, message);

      let dokiReactChance = Math.floor(Math.random() * 2);
      if (dokiReactChance == 1) {
        dokiReact(client, message);
      }
    });
  }
});

client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.message.channel.id == auth.submissionChannelId && reaction.count == 2) {
    confirmInsult(client, reaction);
  }
});

client.login(auth.token);