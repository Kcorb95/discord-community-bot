const {FriendlyError} = require('discord.js-commando');
const Discord = require('discord.js');
const BotClient = require('./structures/BotClient');

const guildSettings = require('./models/GuildSettings');
const Currency = require('./structures/currency/Currency');

const {oneLine} = require('common-tags');
const path = require('path');
const Raven = require('raven');
const winston = require('winston');

const SequelizeProvider = require('./providers/Sequelize');
const {OWNER, TOKEN, SENTRY_TOKEN, COMMAND_PREFIX} = require('./settings');
const Log = require('./structures/Logger');

const loadEvents = require('./functions/loadEvents.js');
const loadFunctions = require('./functions/loadFunctions.js');

const client = new BotClient({
    owner: OWNER,
    commandPrefix: COMMAND_PREFIX,
    unknownCommandResponse: false,
    disableEveryone: true,
    clientOptions: {disabledEvents: ['USER_NOTE_UPDATE', 'VOICE_STATE_UPDATE', 'TYPING_START', 'VOICE_SERVER_UPDATE', 'PRESENCE_UPDATE']},
    messageCacheMaxSize: 10,
    messageCacheLifetime: 1000
});

client.coreBaseDir = `${__dirname}/`;
client.clientBaseDir = `${process.cwd()}/`;

Raven.config(SENTRY_TOKEN).install();

client.setProvider(new SequelizeProvider(client.database));

client.dispatcher.addInhibitor(msg => {
    const blacklist = client.provider.get('global', 'userBlacklist', []);
    if (!blacklist.includes(msg.author.id)) return false;
    return `Has been blacklisted.`;
});

client.dispatcher.addInhibitor(msg => {
    if (msg.channel.topic && msg.channel.topic.includes('[block]')) return 'Command blocked because the topic contains [block].';
    return false;
});

client.on('error', winston.error)
    .on('warn', winston.warn)
    .once('ready', () => Currency.leaderboard())
    .once('ready', async () => {
        client.log = new Log(client);
        client.log.hook({title: 'Logged in', color: client.log.colours.info});

        client.log.info(oneLine`
			Client ready... Logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})
		`);

        loadFunctions(client).then(() => {
            loadEvents(client);
            client.methods = {};
            client.methods.Collection = Discord.Collection;
			client.methods.Embed = Discord.MessageEmbed;
        });

        let settings, channel;
        for (const [, guild] of client.guilds) {
            settings = await guildSettings.findOne({where: {guildID: guild.id}});
            // this should be in Redis perhaps
            if (!settings || !settings.reactions) continue;
            channel = client.channels.get(settings.reactions.channel);
            if (!channel) continue;
            channel.fetchMessages(10);
            channel.fetchPinnedMessages();
        }

        let servers = ` in ${client.guilds.size} servers!`;
        let users = ` with ${client.guilds.reduce((a, b) => a + b.memberCount, 0)} users!`;
        let games = [`type ${client.commandPrefix}help for commands!`, servers, users];
        client.user.setGame(servers);
        setInterval(() => {
            servers = `in ${client.guilds.size} servers!`;
            client.user.setGame(games[Math.floor(Math.random() * games.length)]);
        }, Math.floor(Math.random() * (600000 - 120000 + 1)) + 120000);
    })
    .on('disconnect', () => {
        winston.warn(`[DISCORD]: [${Date.now()}] Disconnected! Exiting app in 10s.`);
        setTimeout(() => {
            process.exit('1');
        }, 10000);
    })
    .on('reconnect', () => winston.warn('[DISCORD]: Reconnecting...'))
    .on('commandRun', (cmd, promise, msg, args) => {
        winston.info(oneLine`
			[DISCORD]: ${msg.author.tag} (${msg.author.id})
			> ${msg.guild ? `${msg.guild.name} (${msg.guild.id})` : 'DM'}
			>> ${cmd.groupID}:${cmd.memberName}
			${Object.values(args).length ? `>>> ${Object.values(args)}` : ''}
		`);
    })
    .on('unknownCommand', msg => {
        if (msg.channel.type === 'dm') return;
        if (msg.author.bot) return;

        const args = {name: msg.content.split(client.commandPrefix)[1].toLowerCase()};
        client.registry.resolveCommand('tags:tag').run(msg, args);
    })
    .on('commandError', (cmd, err) => {
        if (err instanceof FriendlyError) return;
        winston.error(`[DISCORD]: Error in command ${cmd.groupID}:${cmd.memberName}`, err);
    })
    .on('commandBlocked', (msg, reason) => {
        winston.info(oneLine`
			[DISCORD]: Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; User ${msg.author.tag} (${msg.author.id}): ${reason}
		`);
    })
    .on('commandPrefixChange', (guild, prefix) => {
        winston.info(oneLine`
			[DISCORD]: Prefix changed to ${prefix || 'the default'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('commandStatusChange', (guild, command, enabled) => {
        winston.info(oneLine`
			[DISCORD]: Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('groupStatusChange', (guild, group, enabled) => {
        winston.info(oneLine`
			[DISCORD]: Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    });

client.registry
    .registerGroups([
        ['commands', 'Commands'],
        ['anime', 'Anime'],
        ['avataredit', 'AvatarEdit'],
        ['bot', 'Bot'],
        ['config', 'Config'],
        ['economy', 'Economy'],
        ['fun', 'Fun'],
        ['games', 'Games'],
        ['info', 'Info'],
        ['item', 'Item'],
        ['misc', 'Misc'],
        ['music', 'Music'],
        ['nsfw', 'NSFW'],
        ['owner', 'Owner'],
        ['ranks', 'Ranks'],
        ['random', 'Random'],
        ['reactions', 'Reactions'],
        ['rep', 'Rep'],
        ['response', 'Response'],
        ['search', 'Search'],
        ['social', 'Social'],
        ['starboard', 'Starboard'],
        ['tags', 'Tags'],
        ['test', 'Testing'],
        ['textedit', 'TextEdit'],
        ['util', 'Util']
    ])
    .registerDefaultTypes()
    .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .registerDefaultCommands({eval_: false});

client.login(TOKEN);

process.on('unhandledRejection', (err) => {
    if (!err) return;

    let errorString = 'Uncaught Promise Error:\n';
    if (err.status === 400) return console.error(errorString += err.text || err.body.message); // eslint-disable-line consistent-return
    if (!err.response) return console.error(errorString += err.stack); // eslint-disable-line consistent-return

    if (err.response.text && err.response.status) {
        errorString += `Status: ${err.response.status}: ${err.response.text}\n`;
    }
    if (err.response.request && err.response.request.method && err.response.request.url) {
        errorString += `Request: ${err.response.request.method}: ${err.response.request.url}\n`;
    }
    client.log.error(errorString += err.stack);
});

exports.client = client;