const { Command } = require('discord.js-commando');
const UserRep = require('../../models/UserRep');

module.exports = class RepPositiveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rep-add',
      aliases: ['add-rep', 'rep-pos', 'pos-rep'],
      group: 'rep',
      memberName: 'positive',
      description: 'Add a positive reputation point to a user.',
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'whom would you like to give a positive reputation point?',
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

    if (alreadyRepped && alreadyRepped.reputationType === '+') {
      return msg.embed({
        color: 3447003,
        description: `${msg.author}, you have already given a positive reputation point to this user.`
      });
    }
    if (alreadyRepped) await alreadyRepped.destroy();

    await UserRep.create({
      userID: member.id,
      reputationType: '+',
      reputationBy: msg.author.id,
      reputationMessage: message || null
    });
    return msg.embed({
      color: 2817834,
      description: `${msg.author}, you've successfully added a positive reputation point to ${member.displayName}.`
    });
  }
};