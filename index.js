require('dotenv').config();

const Eris = require('eris');
const bot = new Eris(process.env.BOT_TOKEN);

const logger = require('./modules/logger.js');

const database = require('./modules/mongodb.js');

const moment = require('moment');

const express = require('express');
const app = express();
const webPort = 3000;

// Check for empty envars

if (process.env.BOT_TOKEN === null || process.env.BOT_TOKEN === '') {
    logger.logFatal('NO BOT TOKEN SUPPLIED', 'CHECK .ENV FILE');
    process.exit(1)
}

if (process.env.URL === null || process.env.URL === '' || process.env.URL === undefined) {
    logger.logFatal('NO URL SUPPLIED', 'CHECK .ENV FILE');
    process.exit(1)
}

if (process.env.PREFIX === null || process.env.PREFIX === '' || process.env.PREFIX === undefined) {
    logger.logFatal('NO PREFIX SUPPLIED', 'CHECK .ENV FILE');
    process.exit(1)
}

if (process.env.DBURL === null || process.env.DBURL === '' || process.env.DBURL === undefined) {
    logger.logFatal('NO DBURL SUPPLIED', 'CHECK .ENV FILE');
    process.exit(1)
}

// Use envars

const botURL = process.env.URL;
const prefix = process.env.PREFIX;

// Website Pins link
bot.on('messageCreate', (message) => {
    if(message.content === prefix + 'links') {
        const data = {
            "embed": {
                // TODO: Change notion link to botURL when site service works
                "description": "PinUp is a Discord bot to store pinned messages and serve them on a website. For more information, go [here](https://www.notion.so/PinUp-afd24064a4ea401395e34c94499ad90a).",
                "color": 10181046,
                "timestamp": moment().format(),
                "footer": {
                    "icon_url": `${botURL}/assets/avatar.png`,
                    "text": "PinUp"
                },
                "author": {
                    "name": "PinUp",
                    // TODO: Change notion link to botURL when site service works
                    "url": `https://www.notion.so/PinUp-afd24064a4ea401395e34c94499ad90a`,
                    "icon_url": `${botURL}/assets/avatar.png`
                },
                "fields": [
                    {
                        "name": "Server Pins",
                        "value": `${botURL}/${message.channel.guild.id}`,
                        "inline": true
                    },
                    {
                        "name": "Channel Pins",
                        "value": `${botURL}/${message.channel.guild.id}/${message.channel.id}`,
                        "inline": true
                    }
                ]
            }
        };
        bot.createMessage(message.channel.id, data)
    }
});

// Startup

bot.on("ready", () => {
    logger.logInfo(`Pinup started, connected to ${bot.user.username}#${bot.user.discriminator} <${bot.user.id}>`);
    bot.editStatus({
        status: 'watching',
        game: {
            name: 'for pinned messages',
            type: 3
        }
    });
});

// Guild addition

bot.on('guildCreate', (guild) => {
    logger.logInfo(`Pinup added to ${guild.name} <${guild.id}>`);
    database.createCollection(database.dbClient, guild.id)
});

// Pin handling

bot.on('channelPinUpdate', (channel) => {
    logger.logDebug(`Pin update in Guild: ${channel.guild.id} Channel: ${channel.id}`);
    if(moment(moment(channel.lastPinTimestamp)).isAfter(moment().subtract(2, 'seconds'))) {
        logger.logDebug(`Last pin was less than 2 seconds ago in this channel, counting channelPinsUpdate event as a new pin`);
        logger.logDebug(`Fetching pinned messages in ${channel.id}`);
        channel.getPins().then(function (pinned) {
            logger.logDebug(`Latest pin: ${pinned[0].content} <${pinned[0].id}>`);
            database.addDocument(database.dbClient, channel.guild.id, { channel: pinned[0].channel.id,timestamp: pinned[0].timestamp,content: pinned[0].content, author: { id: pinned[0].author.id, name: pinned[0].author.username, discriminator: pinned[0].author.discriminator, avatar: pinned[0].author.avatarURL} });
        })
    }
});

// Bot connection
bot.connect();

// Express server startup

app.listen(webPort, () => logger.logInfo(`Pinup web service started and listening at ${botURL} using port ${webPort}`));
