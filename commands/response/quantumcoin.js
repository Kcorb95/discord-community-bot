const { Command } = require('discord.js-commando');
const sides = ['on nothing', 'on NaN', 'on 0', 'in the air', 'on null'];

module.exports = class QuantumCoinCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'quantum-coin',
            aliases: ['qcoin'],
            group: 'response',
            memberName: 'quantum-coin',
            description: 'Flips a coin that lands on nothing.'
        });
    }

    run(msg) {
        const side = sides[Math.floor(Math.random() * sides.length)];
        return msg.say(`It landed ${side}.`);
    }
};