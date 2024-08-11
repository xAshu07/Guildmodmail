const { SQLiteDatabase } = require('@tfadev/easy-sqlite');
const { CommandsHandler, EventsHandler } = require('horizon-handler');
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    WebhookClient
} = require('discord.js');
require('colors');
require('dotenv').config();
const config = require("./config.js");
const projectVersion = require('./package.json').version || "v0.0.0";

const client = new Client({
    intents: [
        Object.keys(GatewayIntentBits)
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User
    ],
    presence: {
        activities: [{
            name: "DM me to create a mail!",
            type: 1,
            url: "https://www.youtube.com/watch?v=Ee2C_f7HsI8"
        }]
    },
    shards: "auto"
});

const webhookClient = (config.logs.webhookURL || process.env.WEBHOOK_URL )
    ? new WebhookClient({ url: config.logs.webhookURL || process.env.WEBHOOK_URL })
    : null;

const db = new SQLiteDatabase('./SQL/main.db');

(async () => {
    await db.create(
        {
            name: 'bans',
            overwrite: true,
            keys: {
                id: ['INTEGER', { primary: true, autoincrement: true }],
                userId: ['TEXT'],
                guildId: ['TEXT'],
                reason: ['TEXT', { nullable: true }]
            }
        },
        {
            name: 'mails',
            overwrite: true,
            keys: {
                id: ['INTEGER', { primary: true, autoincrement: true }],
                authorId: ['TEXT'],
                guildId: ['TEXT'],
                channelId: ['TEXT'],
                closed: ['BOOLEAN', { nullable: true }]
            }
        }
    );
})();

console.log(`
███╗░░░███╗░█████╗░██████╗░███╗░░░███╗░█████╗░██╗██╗░░░░░
████╗░████║██╔══██╗██╔══██╗████╗░████║██╔══██╗██║██║░░░░░
██╔████╔██║██║░░██║██║░░██║██╔████╔██║███████║██║██║░░░░░
██║╚██╔╝██║██║░░██║██║░░██║██║╚██╔╝██║██╔══██║██║██║░░░░░
██║░╚═╝░██║╚█████╔╝██████╔╝██║░╚═╝░██║██║░░██║██║███████╗
╚═╝░░░░░╚═╝░╚════╝░╚═════╝░╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝╚══════╝
`.underline.blue + `version ${projectVersion}, by Ashu.
`.underline.cyan);

client.login(config.client.token || process.env.CLIENT_TOKEN).catch((e) => {
    console.error('Unable to connect to the bot, this might be an invalid token or missing required intents!\n'.red, e);
});

const commandshandler = new CommandsHandler('./commands/', false);
const eventshandler = new EventsHandler('./events/', false);

commandshandler.on('fileLoad', (command) => console.log('Loaded new command: ' + command.name));
eventshandler.on('fileLoad', (event) => console.log('Loaded new event: ' + event));

module.exports = {
    client,
    webhookClient,
    db,
    commandshandler,
    eventshandler
};

(async () => {
    await commandshandler.load();

    await eventshandler.load(client);
})();

process.on('unhandledRejection', (reason, promise) => {
    console.error("[ANTI-CRASH: unhandledRejection] An error has occured and been successfully handled:".yellow);

    console.error(promise, reason);
});

process.on("uncaughtException", (err, origin) => {
    console.error("[ANTI-CRASH: uncaughtException] An error has occured and been successfully handled:".yellow);

    console.error(err, origin);
});