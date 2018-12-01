/*
    Created by Joshua Brucker
*/

global.__basedir = __dirname;

const Discord = require('discord.js');
const DBL = require("dblapi.js");

const fs = require('fs');
const path = require('path');

const auth = require('./data/auth');
const utils = require('./utils/utils');
const db = require('./utils/db');
const voice = require('./utils/voice');
const commands = require('./commands/commands');

const dokiReact = require('./etc/doki-react');
const dokipoemUpdate = require('./etc/dokipoem-update');
const checkInsults = require('./etc/check-insults');
const confirmInsult = require('./etc/confirm-insult');
const onVote = require('./webhook/on-vote');

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
})

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
    db.guild.verifyGuilds(client, () => {
        setInterval(() => {
            checkInsults(client);
        }, 60000);
    });

    utils.setActivity(client);
    setInterval(() => {
        utils.setActivity(client);
    }, 3600000);

    client.guilds.get(auth.dokihubId).channels.get(auth.submissionChannelId).fetchMessages();
    setInterval(() => {
        client.guilds.get(auth.dokihubId).channels.get(auth.submissionChannelId).fetchMessages();
    }, 600000);

    console.log('I am ready!');
});

client.on('guildCreate', (guild) => {
    db.guild.addGuild(guild.id, () => {
        let message = ('Square up! Your true love has joined the server.'
                + ' You can make a channel called `doki-poems` to track poems, and'
                + ' use \`-help\` for more commands. Best of luck, dummies!');

        if (guild.systemChannel) {
            guild.systemChannel.send(message);
        } else {
            let channel = utils.getMostPermissibleChannel(client, guild);
            if (channel) {
                channel.send(message);
            }
        }
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

            let content = message.content.toLowerCase();

            if (content.substring(0, prefix.length) == prefix && content.length > 1) {
                if (message.channel.name != 'doki-poems') {
                    let args = content.substring(prefix.length).split(' ');
                    let cmd = args[0].toLowerCase();
                    args = args.splice(1);

                    switch(cmd) {
                        case 'doki':
                            commands.doki(message, args);
                            break;
                        case 'waifu':
                            commands.waifu(message, args);
                            break;
                        case 'moniquote':
                            commands.moniquote(message, args);
                            break;
                        case 'nep':
                            commands.nep(message, args);
                            break;
                        case 'dp':
                        case 'dokipoem':
                            if (message.guild.channels.find((channel) => channel.name === 'doki-poems')) {
                                commands.dokipoem(guild, message, args);
                            } else {
                                message.channel.send('Your server can make its own Doki Doki poems! All you have to do is create a channel titled' +
                                                     ' \`doki-poems\` and DokiBot will add the first word posted each day to a poem.');
                            }
                            break;
                        case 'help':
                            commands.help(message, args);
                            break;
                        case 'ost':
                            commands.ost(message, args);
                            break;
                        case 'prefix':
                            commands.prefix(message, args);
                            break;
                        case 'insult':
                            args = message.content.substring(prefix.length).split(' ');
                            args = args.splice(1);
                            commands.insult(client, message, args);
                            break;
                        case 'anime':
                            commands.anime(message, args);
                            break;
                        case 'neko':
                            commands.neko(message, args);
                            break;
                        case 'vote':
                            commands.vote(message);
                            break;
                    }

                    // Use if statement to avoid potential missed break statement
                    if (cmd == 'broadcast') {
                        args = message.content.substring(prefix.length).split(' ');
                        args = args.splice(1);
                        commands.broadcast(message, args, client);
                    }
                }
            }

            dokipoemUpdate(guild, message, client);

            let dokiReactChance = Math.floor(Math.random() * 2);
            if (dokiReactChance == 1) {
                dokiReact(message, client);
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