require('dotenv').config();

const Eris = require('eris');

const logger = require('./modules/logger.js');

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
// Use envars

const bot = new Eris(process.env.BOT_TOKEN);
const botURL = process.env.URL;
const prefix = process.env.PREFIX;

// Website Pins link
bot.on('messageCreate', (message) => {
    if(message.content === prefix + 'links') {
        const data = {
            "embed": {
                "description": "PinUp is a Discord bot to store pinned messages and serve them on a website",
                "color": 10181046,
                "timestamp": "2020-04-08T14:15:44.581Z",
                "footer": {
                    "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
                    "text": "PinUp"
                },
                "author": {
                    "name": "PinUp",
                    "url": `${botURL}`,
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

bot.on('ready', () => {
    logger.logInfo(`Pinup started, connected to ${bot.user.username}#${bot.user.discriminator} <${bot.user.id}>`)
    bot.editStatus('online', {
        name: 'for pinned messages',
        type: 3
    })
});


// Bot connection
bot.connect();

// Express server startup

app.listen(webPort, () => logger.logInfo(`Pinup web service started and listening at ${botURL} using port ${webPort}`));
