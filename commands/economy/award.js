const { Command } = require('discord.js-commando');

const Currency = require('../../structures/currency/Currency');

module.exports = class MoneyAddCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'award',
      group: 'economy',
      memberName: 'award',
      description: `Add ${Currency.textPlural} to a certain user.`,
      details: `Add amount of ${Currency.textPlural} to a certain user.`,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'reason',
          label: 'why are you awarding this',
          prompt: `why are you awarding this\n`,
          type: 'string'
        },
        {
          key: 'doritos',
          label: 'amount of doritos to add',
          prompt: `how many ${Currency.textPlural} do you want to give that user?\n`,
          type: 'integer'
        },
        {
          key: 'member',
          prompt: `what user would you like to give ${Currency.textPlural}?\n`,
          type: 'member'
        }
      ]
    });
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  async run(msg, args) {
    const { member, doritos } = args;
    Currency._changeBalance(member.id, doritos);
      member.send(`**You have received ${Currency.convert(doritos)} with the reason:**\n ${args.reason}`);
    return msg.reply(`successfully added ${Currency.convert(doritos)} to ${member.displayName}'s balance.`).then(message => {
      msg.delete(30 * 1000);
      message.delete(30 * 1000);
    });
  }
};