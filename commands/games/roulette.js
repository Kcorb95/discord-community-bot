const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const colors = require('../../assets/_data/colors.json');
const Currency = require('../../structures/currency/Currency');
const Roulette = require('../../structures/games/Roulette');

module.exports = class RouletteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roulette',
            aliases: ['roulette'],
            group: 'games',
            memberName: 'roulette',
            description: `Play a game of roulette for ${Currency.textPlural}!`,
            details: `Play a game of roulette for ${Currency.textPlural}.`,
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 30
            },
            args: [
                {
                    key: 'bet',
                    prompt: `how many ${Currency.textPlural} do you want to bet?\n`,
                    type: 'integer',
                    validate: async (bet, msg) => {
                        bet = parseInt(bet);
                        const balance = await Currency.getBalance(msg.author.id);

                        if (balance < bet) {
                            return `
								you don't have enough ${Currency.textPlural} to bet.
								Your current account balance is ${Currency.convert(balance)}.
								Please specify a valid amount of ${Currency.textPlural}.
							`;
                        }

                        if (![2, 5, 10].includes(bet)) {
                            return `
								please choose \`2, 5, 10\` for your bet.
							`;
                        }

                        return true;
                    }
                },
                {
                    key: 'space',
                    prompt: 'On what space do you want to bet?',
                    type: 'string',
                    validate: space => {
                        if (!Roulette.hasSpace(space)) {
                            return `
								That is not a valid betting space. Use \`roulette-info\` for more information.
							`;
                        }

                        return true;
                    },
                    parse: str => str.toLowerCase()
                }
            ]
        });
    }

    run(msg, {bet, space}) {
        let roulette = Roulette.findGame(msg.guild.id);

        if (roulette) {
            if (roulette.hasPlayer(msg.author.id)) {
                return msg.embed({
                    color: colors.red,
                    description: 'you have already put a bet in this game of roulette.'
                });
            }

            roulette.join(msg.author, bet, space);
            Currency.removeBalance(msg.author.id, bet);

            return msg.embed({
                color: colors.green,
                description: `you have successfully placed your bet of ${Currency.convert(bet)} on ${space}.`
            });
        }

        roulette = new Roulette(msg.guild.id);
        roulette.join(msg.author, bet, space);
        Currency.removeBalance(msg.author.id, bet);

        return msg.embed({
            color: colors.blue,
            description: stripIndents`
			A new game of roulette has been initiated!
			Use ${msg.usage()} in the next 15 seconds to place your bet.`
        })
            .then(async () => {
                setTimeout(() => msg.embed({
                    color: colors.blue,
                    description: '5 more seconds for new people to bet.'
                }), 10000);
                setTimeout(() => msg.embed({color: colors.blue, description: 'The roulette starts spinning!'}), 14500);

                const winners = await roulette.awaitPlayers(16000).filter(player => player.winnings !== 0);

                winners.forEach(winner => Currency.changeBalance(winner.user.id, winner.winnings));

                return msg.embed({
                    color: roulette.winSpaces[1] ? colors.black : colors.red,
                    description: stripIndents`
						The ball landed on: **${roulette.winSpaces[1]
                        ? roulette.winSpaces[1]
                        : ''} ${roulette.winSpaces[0]}**!
						${winners.length !== 0
                        ? `__**Winners:**__
							${winners.map(winner => `${winner.user.username} won ${Currency.convert(winner.winnings)}`)
                            .join('\n')}`
                        : '__**No winner.**__'}
					`
                });
            });
    }
};