const { Command } = require('discord.js-commando');
const {lastNames, maleNames, femaleNames} = require('../../assets/json/name');

module.exports = class RandomNameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'randomname',
            group: 'response',
            memberName: 'randomname',
            description: 'Generates a random name.',
            args: [
                {
                    key: 'gender',
                    prompt: 'Which gender do you want to generate a name for?',
                    type: 'string',
                    validate: gender => {
                        if (['male', 'female'].includes(gender.toLowerCase())) return true;
                        return 'Please enter either `male` or `female`.';
                    },
                    parse: gender => gender.toLowerCase()
                }
            ]
        });
    }

    run(msg, args) {
        const {gender} = args;
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        if (gender === 'male') {
            const name = maleNames[Math.floor(Math.random() * maleNames.length)];
            return msg.say(`${name} ${lastName}`);
        } else if (gender === 'female') {
            const name = femaleNames[Math.floor(Math.random() * femaleNames.length)];
            return msg.say(`${name} ${lastName}`);
        }
    }
};