const { Command } = require('discord.js-commando');

const UserProfile = require('../../models/UserProfile');

module.exports = class ShowRepCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'showrep',
      aliases: ['repshow'],
      group: 'rep',
      memberName: 'showrep',
      description: 'Display the reputation a user has received from other people.',
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'whom do you want to give your daily?\n',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run(msg, args) {
    const user = args.member || msg.member;

    const reputation = await UserProfile.findOne({ where: { userID: user.id } });
    if (!reputation) return msg.reply(`This user has no rep!`);

    return msg.reply(`${user.displayName} has ${reputation.rep} reputation points.`);
  }
};