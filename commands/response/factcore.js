const { Command } = require('discord.js-commando');
const facts = require('../../assets/json/factcore');

module.exports = class FactCoreCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'fact-core',
            group: 'response',
            memberName: 'fact-core',
            description: 'Says a random Fact Core quote.'
        });
    }

    run(msg) {
        const fact = facts[Math.floor(Math.random() * facts.length)];
        return msg.say(fact);
    }
};