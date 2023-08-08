const {Command} = require('discord.js-commando');
const _sdata = require('../../assets/_data/static_data.json');
const Currency = require('../../structures/currency/Currency');
module.exports = class MoneyAddCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add-money',
            aliases: [
                'money-add',
                'add-dorito',
                'add-doritos',
                'dorito-add',
                'doritos-add',
                'add'
            ],
            group: 'economy',
            memberName: 'add',
            description: `Add ${Currency.textPlural} to a certain user.`,
            details: `Add amount of ${Currency.textPlural} to a certain user.`,
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3
            },
            args: [
                {
                    key: 'member',
                    prompt: `what user would you like to give ${Currency.textPlural}?\n`,
                    type: 'member'
                },
                {
                    key: 'doritos',
                    label: 'amount of doritos to add',
                    prompt: `how many ${Currency.textPlural} do you want to give that user?\n`,
                    type: 'integer'
                }
            ]
        });
    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    run(msg, {member, doritos}) {
        Currency._changeBalance(member.id, doritos);
        return msg.embed({
            color: _sdata.colors.green,
            description: `${msg.author}, successfully added ${Currency.convert(doritos)} to ${member.displayName}'s balance.`
        });
    }
};