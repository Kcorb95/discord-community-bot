const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const moment = require('moment');

const Currency = require('../../structures/currency/Currency');
const Trade = require('../../structures/currency/Trade');

module.exports = class MoneyTradeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'trade',
            aliases: [
                'trade-money',
                'trade-dorito',
                'trade-doritos',
                'money-trade',
                'dorito-trade',
                'doritos-trade',
                'give'
            ],
            group: 'economy',
            memberName: 'trade',
            description: `Trades the ${Currency.textPlural} you have earned.`,
            details: `Trades the amount of ${Currency.textPlural} you have earned.`,
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
                    label: 'amount of doritos to trade',
                    prompt: `how many ${Currency.textPlural} do you want to give that user?\n`,
                    validate: doritos => /^(?:\d+|all|-all|-a)$/g.test(doritos),
                    parse: async (doritos, msg) => {
                        const balance = await Currency.getBalance(msg.author.id);

                        if (['all', '-all', '-a'].includes(doritos)) return parseInt(balance);
                        return parseInt(doritos);
                    }
                }
            ]
        });
    }

    async run(msg, args) {
        const member = args.member;
        const doritos = args.doritos > 50 ? 50 : args.doritos;
        if (member.id === msg.author.id) {
            return msg.embed({
                color: 14365748,
                description: `${msg.author}, you can't trade ${Currency.textPlural} with yourself, ya dingus.`
            });
        }
        if (member.user.bot) {
            return msg.embed({
                color: 14365748,
                description: `${msg.author}, don't give your ${Currency.textPlural} to bots: they're bots, man.`
            });
        }
        if (doritos <= 0) {
            return msg.embed({
                color: 14365748,
                description: `${msg.author}, you can't trade 0 or less ${Currency.convert(0)}.`
            });
        }

        const userBalance = await Currency.getBalance(msg.author.id);

        const totalSent = await Trade.totalSent(msg.member.id);
        const nextGive = await Trade.nextGive(msg.member.id);
        const canSend = await Trade.canSend(msg.member.id);

        const totalReceived = await Trade.totalReceived(member.id);
        const nextReceive = await Trade.nextReceive(member.id);
        const canReceive = await Trade.canReceive(member.id);

        if (args.doritos === userBalance && totalSent > 0 && totalSent < 50) {
            Currency.removeBalance(msg.author.id, args.doritos);
            Currency.addBalance(member.id, args.doritos);
            return msg.embed({
                color: 2817834,
                description: `${msg.author}, ${member.displayName} successfully received your ${Currency.convert(args.doritos)}!`
            });
        }

        if (userBalance < doritos) {
            return msg.embed({
                color: 14365748,
                description: stripIndents`
				${msg.author}, you don't have that many ${Currency.textPlural} to trade!
				You currently have ${Currency.convert(userBalance)} on hand.`
            });
        }

        if (!canSend) {
            return msg.embed({
                color: 14365748,
                description: stripIndents`
				${msg.author}, you have already given away the maximum amount of ${Currency.textPlural} allowed per day today. (${totalSent})
				You can send more in ${moment.duration(nextGive).format('hh [hours] mm [minutes]')}`
            });
        }

        if (!canReceive) {
            return msg.embed({
                color: 14365748,
                description: stripIndents`
				${msg.author}, this user has already received the maximum amount of ${Currency.textPlural} allowed per day today. (${totalReceived})
				They can receive more in ${moment.duration(nextReceive).format('hh [hours] mm [minutes]')}`
            });
        }

        await Trade.updateGiven(msg.member.id, doritos);
        await Trade.updateReceived(member.id, doritos);
        Currency.removeBalance(msg.author.id, doritos);
        Currency.addBalance(member.id, doritos);
        return msg.embed({
            color: 2817834,
            description: `${msg.author}, ${member.displayName} successfully received your ${Currency.convert(doritos)}!`
        });
    }
};