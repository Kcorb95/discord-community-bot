const {Command} = require('discord.js-commando');
const snekfetch = require('superagent');

module.exports = class BirdCommand extends Command {
    constructor(Client) {
        super(Client, {
            name: 'birb',
            aliases: ['bird'],
            group: 'reactions',
            memberName: 'birb',
            description: 'Outputs a random birb.'
        });
    }

    async run(message) {
        const bird = await snekfetch.get('http://shibe.online/api/birds?count=1&httpsurls=true');
        return message.channel.send({
            embed: {
                footer: {text: `Requested by ${message.author.tag}`},
                image: {url: bird.body[0]}
            }
        });
    }
};