const {Command} = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');
const config = require('../../settings');


module.exports = class RankInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ranks',
            group: 'ranks',
            aliases: ['ranklist', 'listrank'],
            memberName: 'ranks',
            description: 'list of obtainable ranks with a cost',
            guildOnly: true
        });
    }

    async run(msg) {
        let settings = await guildSettings.findOne({where: {guildID: msg.guild.id}});
        if (!settings) settings = await guildSettings.create({guildID: msg.guild.id}).catch(winston.error);
        let ranks = settings.ranks;

        const embed = await new this.client.methods.Embed()
            .setColor('#aed82f')
            .setDescription('__**Ranks:**__');
        for (let i = 0; i < ranks.length; i++) {
            embed.addField(`@${msg.guild.roles.get(settings.ranks[i].role).name}`, `**Cost:** ${settings.ranks[i].cost} ${config.Emoji}'s`);
        }
        return msg.channel.send({embed});
    }
};