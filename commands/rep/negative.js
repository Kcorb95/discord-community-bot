const { Command } = require('discord.js-commando');
const UserRep = require('../../models/UserRep');

module.exports = class RepNegativeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rep-remove',
      aliases: ['rep-remove', 'rep-rem', 'rem-rep', 'rep-neg', 'neg-rep'],
      group: 'rep',
      memberName: 'negative',
      description: 'Add a negative reputation point to a user.',
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'whom would you like to give a negative reputation point?',
          type: 'member'
        },
        {
          key: 'message',
          prompt: 'add a nice message.',
          type: 'string',
          max: 200,
          default: ''
        }
      ]
    });
  }

  async run(msg, { member, message }) {
    if (member.id === msg.author.id) {
      return msg.embed({
        color: 14365748,
        description: `${msg.author}, you can't change your own reputation like that!`
      });
    }

    const alreadyRepped = await UserRep.findOne({
      where: {
        userID: member.id,
        reputationBy: msg.author.id
      }
    });

    if (alreadyRepped && alreadyRepped.reputationType === '-') {
      return msg.embed({
        color: 3447003,
        description: `${msg.author}, you have already given a negative reputation point to this user.`
      }); // eslint-disable-line max-len
    }
    if (alreadyRepped) await alreadyRepped.destroy();

    await UserRep.create({
      userID: member.id,
      reputationType: '-',
      reputationBy: msg.author.id,
      reputationMessage: message || null
    });
    return msg.embed({
      color: 2817834,
      description: `${msg.author}, you've successfully added a negative reputation point to ${member.displayName}.`
    });
  }
};