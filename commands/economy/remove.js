const { Command } = require('discord.js-commando');

const Currency = require('../../structures/currency/Currency');

module.exports = class MoneyRemoveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-money',
      aliases: [
        'money-remove',
        'remove-dorito',
        'remove-doritos',
        'rd',
        'rm',
        'dorito-remove',
        'doritos-remove',
        'remove'
      ],
      group: 'economy',
      memberName: 'remove',
      description: `Remove ${Currency.textPlural} from a certain user.`,
      details: `Remove amount of ${Currency.textPlural} from a certain user.`,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: `what user would you like to remove ${Currency.textPlural} from?\n`,
          type: 'member'
        },
        {
          key: 'doritos',
          label: 'amount of doritos to remove',
          prompt: `how many ${Currency.textPlural} do you want to remove from that user?\n`,
          type: 'integer'
        }
      ]
    });
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  run(msg, { member, doritos }) {
	  Currency.removeBalance(member.id, doritos);
    return msg.embed({
      color: 2817834,
      description: `
			${msg.author}, successfully removed ${Currency.convert(doritos)} from ${member.displayName}'s balance.`
    });
  }
};