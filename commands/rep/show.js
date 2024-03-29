const { Command, util } = require('discord.js-commando');
const UserRep = require('../../models/UserRep');

module.exports = class RepShowCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'show-reputation',
      group: 'rep',
      memberName: 'show-reputation',
      description: 'Display the reputation a user has received from other people.',
      guildOnly: true,
      args: [
        {
          key: 'page',
          prompt: 'which page do you want to view?',
          type: 'integer',
          default: 1
        }
      ]
    });
  }

  async run(msg, { page }) {
    const reputation = await UserRep.findAll({ where: { userID: msg.author.id } });
    const positive = reputation.filter(rep => rep.reputationType.trim() === '+').length;
    const negative = reputation.length - positive;
    const paginated = util.paginate(reputation, page, 5);
    const reputationMessages = paginated.items.map(rep => ({
      name: `[ ${rep.reputationType.trim()} ] ${this.client.users.get(rep.reputationBy).username}`,
      value: rep.reputationMessage || '*-no message-*'
    }));
    return msg.embed({
      color: positive === negative ? 14845440 : positive > negative ? 2817834 : 14365748,
      author: {
        name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
		  icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
      },
      fields: [
        {
          name: 'Positive Reputation',
          value: positive.toString(),
          inline: true
        },
        {
          name: 'Negative Reputation',
          value: negative.toString(),
          inline: true
        },
        ...reputationMessages
      ],
      footer: { text: paginated.maxPage > 1 ? `Use ${msg.usage()} to view a specific page.` : '' }
    });
  }
};