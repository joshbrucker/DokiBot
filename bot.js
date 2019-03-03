/*
    Created by Joshua Brucker
*/

global.__basedir = __dirname;

const Discord = require('discord.js');
const DBL = require("dblapi.js");

const fs = require('fs');
const path = require('path');

const auth = require('./data/auth');
const db = require('./utils/db');
const utils = require('./utils/utils');
const voice = require('./utils/audio/voice');

// Client Ready
const checkInsults = require('./event_utils/client_ready/check-insults');
const setActivity = require('./event_utils/client_ready/set-activity');

// Message
const dokiReact = require('./event_utils/message/doki-react');
const executeCmd = require('./event_utils/message/execute-cmd');
const poemUpdate = require('./event_utils/message/poem-update');

// React
const confirmInsult = require('./event_utils/react/confirm-insult');

// Webhook Vote
const onVote = require('./event_utils/webhook_vote/on-vote');

const client = new Discord.Client();

const dbl = new DBL(auth.dbltoken, { webhookPort: auth.webhookPort, webhookAuth: auth.webhookAuth }, client);

dbl.webhook.on('ready', (hook) => {
    console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
});

dbl.webhook.on('vote', (vote) => {
    onVote(vote);
});

process.on('unhandledRejection', (reason, p) => {
    if (reason.message != 'Missing Access' && reason.message != 'Missing Permissions') {
        console.log('Unhandled Rejection:', reason);
    }
});

client.on('error', (error) => {
    console.log('Client Error: ', error);
});

dbl.on('error', e => {
    console.log('Discord Bots List Error: ', e);
});

process.on('SIGINT', (code) => {
    for (let id in voice.getServers()) {
        if (voice.getServers().hasOwnProperty(id)) {
            let vc = client.guilds.get(id).voiceConnection;
            if (vc) {
                vc.disconnect();
            }
        }
    }

    process.exit();
});

client.on('ready', () => {
    db.guild.verifyGuilds(client, (addedGuilds) => {
        for (let i = 0; i < addedGuilds.length; i++) {
            utils.sendWelcomeMsg(client, addedGuilds[i]);
            db.guild.setDefaultChannel(addedGuilds[i].id, utils.getJoinChannel(client, addedGuilds[i]).id);
        }

        setInterval(() => {
            checkInsults(client);
        }, 60000);
    });

    setActivity(client);
    setInterval(() => {
        setActivity(client);
    }, 3600000);

    client.guilds.get(auth.dokihubId).channels.get(auth.submissionChannelId).fetchMessages();
    setInterval(() => {
        client.guilds.get(auth.dokihubId).channels.get(auth.submissionChannelId).fetchMessages();
    }, 600000);

    console.log('I am ready!');
});

client.on('guildCreate', (guild) => {
    db.guild.addGuild(guild.id, () => {
        utils.sendWelcomeMsg(client, guild);
        db.guild.setDefaultChannel(guild.id, utils.getJoinChannel(client, guild).id);
    });
});

client.on('guildDelete', (guild) => {
    db.guild.removeGuild(guild.id);
    voice.removeServer(guild.id);
});

client.on('message', (message) => {
    if (message.guild) {
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