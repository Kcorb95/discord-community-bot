const Currency = require('../structures/currency/Currency');
const guildSettings = require('../models/GuildSettings');
const userProfile = require('../models/UserProfile');

const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const { stripIndents } = require('common-tags');
const { Emoji } = require('../settings');
const winston = require('winston');
const redis = require('../structures/redis');

const Random = require('mersennetwister');
const random = new Random();

let spokenRecently = [];

exports.run = async (bot, message) => { // eslint-disable-line
    if (message.author.bot) return;
    if (message.channel.type === 'dm' && !message.author.bot) {
        if (message.attachments.array().length > 0) return bot.owners[0].send(`\`${message.author.username}\` - ${message.attachments.first().url}`);
        return bot.owners[0].send(`\`${message.author.username}\` - ${message.content}`);
    }

    /**
     * Logging of pictures because discord logging doesn't work properly for deleted images
     */
    if (message.attachments.array().length > 0 && !message.author.bot) {
        const link = await message.attachments.first().url;
        const dir = await path.join('/srv', 'samba', 'share', `Server-${message.guild.id}`, `${message.author.username} -- ${message.attachments.first().id}.png`);

        const res = await request.defaults({ encoding: null })(link).catch(() => winston.error);

        fs.writeFileSync(dir, res);
    }

    if (!message.guild) return null;
    const member = message.member || await message.guild.fetchMember(message.author);

    const inviteFilter = await redis.db.getAsync(`invitefilter${message.guild.id}`).then(JSON.parse);
    const inviteRegex = /(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i;
    if (!bot.funcs.isStaff(member) && inviteFilter && inviteRegex.test(message.content.toLowerCase())) {
        message.delete();
        message.reply('advertisement is prohibited in this server.');
        return;
    }

    const words = await redis.db.getAsync(`filter${message.guild.id}`).then(JSON.parse);
    const enabled = await redis.db.getAsync(`filterenabled${message.guild.id}`).then(JSON.parse);
    if (enabled && words) {
        if (!bot.funcs.isStaff(member) && bot.funcs.filter(words, message.content)) {
            message.author.send(`Your message was deleted due to breaking the filter!\nContent: \`${message.content}\``);
            message.delete();
            return;
        }
    }

    const slowmode = await redis.db.hgetallAsync(`slowmode${message.guild.id}`).then(JSON.parse);
    if (slowmode && slowmode.enabled) {
        const slowuser = await redis.db.hgetallAsync(`slowuser${message.guild.id}${message.author.id}`) || {
            tokens: 0,
            lastUpdate: Date.now()
        };
        if (Date.now() - slowuser.lastUpdate > slowmode.cooldown * 1000) {
            redis.db.del(`slowuser${message.guild.id}${message.author.id}`);
        }
        else if (slowuser.tokens === slowmode.tokens) {
            message.delete();
            message.author.send('Your message was deleted due to speaking too fast during slowmode.');
            // consider muting for specified cooldown time, 3rd option in slowconfig
            return;
        }
        else {
            const tokens = parseInt(slowuser.tokens);
            redis.db.hmset(`slowuser${message.guild.id}${message.author.id}`, { tokens: tokens + 1 });
        }
    }

    if (spokenRecently.includes(member.id)) return null;
    //User has not spoken recently, and is not a bot
    let settings = await guildSettings.findOne({ where: { guildID: message.guild.id } });
    if (!settings) settings = await guildSettings.create({ guildID: message.guild.id }).catch(winston.error);

    spokenRecently.push(member.id); //add user to the list of users who recently spoke
    setTimeout(() => {
        const index = spokenRecently.indexOf(member.id); //remove the user from the list of recently spoken people
        spokenRecently.splice(index, 1);
    }, 5 * 60 * 1000);//5-Minutes = 5 * 60 * 1000

    /**
     * Begin New Member Check
     */
    //Does this user have the 'Member' Role?
    if (!settings.memberRank || !settings.memberRank.id) return null;

    if (!member.roles.has(settings.memberRank.id)) { //Open Member Check
        const profile = await userProfile.findOne({ where: { userID: member.id } }) || await userProfile.create({ userID: member.id }).catch(winston.error);
        let newMember = profile.newMember;

        //Setting of the counter
        if (!newMember.count) newMember.count = 1;
        else newMember.count++;

        const message = stripIndents`**You have gained a point!**\n
            You need **6 points** to gain the new member role so that you unlock the rest of the server.\n
            You currently have: **${newMember.count} points**\n
            Gain points by talking in chat every 5 minutes.\n
            To check your progress, check this message as it will update every time you get a point :)`;
        const dm = await member.createDM();

        //Sending of the message
        if (!newMember.messageID) {
            const sentMessage = await dm.send(message);
            newMember.messageID = sentMessage.id;
            profile.newMember = newMember;
            profile.save().catch(winston.error);
        } else {
            const editMessage = await dm.fetchMessage(profile.newMember.messageID);
            editMessage.edit(message);
            profile.newMember = newMember;
            profile.save().catch(winston.error);
        }

        if (newMember.count >= 6) { //they have reached enough to gain the role
            await member.addRole(settings.memberRank.id); //give them the new rank
            const editMessage = await dm.fetchMessage(profile.newMember.messageID);
            editMessage.edit('You are now a member!\nYou may now upload images and speak in voice chat as well as start collecting doritos.');
            profile.rank = 1;
            profile.save().catch(winston.error);
        }
        profile.newMember = newMember;
        return profile.save().catch(winston.error);
    }//End Member Check

    /**
     * Begin Currency Check
     */
    if (!settings.currency.channels || !settings.currency.channels.includes(message.channel.id)) { //Can currency generate in this channel?

        let rand = Math.floor(random.random() * 4) + 1; //get a random number between 1 and 4
        const currencyEarned = rand === 2; //is the number equal to 2?
        if (currencyEarned) Currency.addBalance(member.id, 1);
    }
};