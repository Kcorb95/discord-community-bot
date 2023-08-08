const {Command} = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');
const userProfile = require('../../models/UserProfile');
const Currency = require('../../structures/currency/Currency');

module.exports = class FixRanksCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'updatemyshitfam',
            group: 'ranks',
            memberName: 'updatemyshitfam',
            description: 'fixes yo shit',
            guildOnly: true
        });
    }

    hasPermission(msg) {
        return msg.author.id === this.client.options.owner;
    }

    async run(msg) {
        let settings = await guildSettings.findOne({where: {guildID: msg.guild.id}});
        if (!settings) settings = await guildSettings.create({guildID: msg.guild.id}).catch(winston.error);
        const ranks = settings.ranks;
        const start = new Date().getTime();
        const members = msg.guild.members.array();
        msg.reply(members.length);
        for (let i = 0; i < members.length; i++) {
            let profile = await userProfile.findOne({where: {userID: members[i].id}});
            if (!profile) profile = await userProfile.create({userID: members[i].id});
            if (members[i].roles.has(ranks[11].role)) {
                profile.rank = 13;
            } else if (members[i].roles.has(ranks[10].role)) {
                profile.rank = 12;
            } else if (members[i].roles.has(ranks[9].role)) {
                profile.rank = 11;
            } else if (members[i].roles.has(ranks[8].role)) {
                profile.rank = 10;
            } else if (members[i].roles.has(ranks[7].role)) {
                profile.rank = 9;
            } else if (members[i].roles.has(ranks[6].role)) {
                profile.rank = 8;
            } else if (members[i].roles.has(ranks[5].role)) {
                profile.rank = 7;
            } else if (members[i].roles.has(ranks[4].role)) {
                profile.rank = 6;
            } else if (members[i].roles.has(ranks[3].role)) {
                profile.rank = 5;
            } else if (members[i].roles.has(ranks[2].role)) {
                profile.rank = 4;
            } else if (members[i].roles.has(ranks[1].role)) {
                profile.rank = 3;
            } else if (members[i].roles.has(ranks[0].role)) {
                profile.rank = 2;
            } else if (members[i].roles.has(settings.memberRank.id)) {
                profile.rank = 1;
            } else {
                profile.rank = 0;
            }
            profile.save().catch(winston.error);
        }
        const end = new Date().getTime();
        msg.reply(`Holy shit it worked.\nTime:${end - start}`);
    }
};