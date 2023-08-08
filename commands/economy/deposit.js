const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const Bank = require('../../structures/currency/Bank');
const Currency = require('../../structures/currency/Currency');

module.exports = class DepositCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'deposit',
      group: 'economy',
      memberName: 'deposit',
      description: `Deposit ${Currency.textPlural} into the bank.`,
      details: `Deposit ${Currency.textPlural} into the bank.`,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'doritos',
          label: 'amount of doritos to deposit',
          prompt: `how many ${Currency.textPlural} do you want to deposit?\n`,
          validate: doritos => /^(?:\d+|all|-all|-a)$/g.test(doritos),
          parse: async(doritos, msg) => {
            const balance = await Currency.getBalance(msg.author.id);

            if (['all', '-all', '-a'].includes(doritos)) return parseInt(balance);
            return parseInt(doritos);
          }
        }
      ]
    });
  }

  async run(msg, { doritos }) {
    if (doritos <= 0) {
      return msg.embed({
        color: 14365748,
        description: `${msg.author}, you can't deposit 0 or less ${Currency.convert(0)}.
			`
      });
    }

    const userBalance = await Currency.getBalance(msg.author.id);
    if (userBalance < doritos) {
      return msg.embed({
        color: 14365748,
        description: stripIndents`
				${msg.author}, you don't have that many ${Currency.textPlural} to deposit!
				You currently have ${Currency.convert(userBalance)} on hand.
			`
      });
    }

    Bank.deposit(msg.author.id, doritos);
    return msg.embed({
      color: 2817834,
      description: `${msg.author}, successfully deposited ${Currency.convert(doritos)} to the bank!
			`
    });
  }
};