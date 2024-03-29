const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const Bank = require('../../structures/currency/Bank');
const Currency = require('../../structures/currency/Currency');

module.exports = class WidthdrawCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'withdraw',
      group: 'economy',
      memberName: 'withdraw',
      description: `Withdraw ${Currency.textPlural} from the bank.`,
      details: `Withdraw ${Currency.textPlural} from the bank.`,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'doritos',
          label: 'amount of doritos to withdraw',
          prompt: `how many ${Currency.textPlural} do you want to withdraw?\n`,
          validate: doritos => /^(?:\d+|all|-all|-a)$/g.test(doritos),
          parse: async(doritos, msg) => {
            const balance = await Bank.getBalance(msg.author.id);

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
        description: `${msg.author}, you can't withdraw 0 or less ${Currency.convert(0)}.`
      });
    }

    const userBalance = await Bank.getBalance(msg.author.id);
    if (userBalance < doritos) {
      return msg.embed({
        color: 14365748,
        description: stripIndents`
				${msg.author}, you do not have that many ${Currency.textPlural} in your balance!
				Your current balance is ${Currency.convert(userBalance)}.`
      });
    }

    const bankBalance = await Currency.getBalance('bank');
    if (bankBalance < doritos) {
      return msg.embed({
        color: 14365748,
        description: stripIndents`
				${msg.author}, sorry, but the bank doesn't have enough ${Currency.textPlural} for you to withdraw!
				Please try again later.`
      });
    }

    Bank.withdraw(msg.author.id, doritos);
    return msg.embed({
      color: 2817834,
      description: `${msg.author}, successfully withdrew ${Currency.convert(doritos)} from the bank!`
    });
  }
};