const { Command } = require('discord.js-commando');
const { oneLine, stripIndents } = require('common-tags');
const moment = require('moment');

const Redis = require('../../structures/redis');

const UserProfile = require('../../models/UserProfile');
const Currency = require('../../structures/currency/Currency');

module.exports = class RepCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rep',
      group: 'rep',
      memberName: 'rep',
      description: 'Add a positive reputation point to a user.',
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'whom would you like to give a positive reputation point?',
          type: 'member'
        }
      ]
    });
  }

  async run(msg, args) {
    const { member } = args;

    if (member.id === msg.author.id) return msg.reply('you can\'t give yourself rep!!');

    const hasRep = await Redis.db.getAsync(`rep${msg.author.id}`);
    if (hasRep) {
      const nextRep = await 24 * 60 * 60 * 1000 - (Date.now() - await Redis.db.getAsync(`rep${msg.author.id}`));
      return msg.reply(stripIndents`
				you have already given rep today!!
				You can give rep again in: ${moment.duration(nextRep).format('hh [hours] mm [minutes]')}
			`).then(message => {
        msg.delete(30 * 1000);
        message.delete(30 * 1000);
      });
    }

    const balance = await Currency.getBalance(msg.author.id);
    if (balance < 5) {
      return msg.reply(oneLine`
        you do not have enough ${Currency.textPlural} to do this,
        your current balance is ${Currency.convert(balance)}.`).then(message => {
        msg.delete(30 * 1000);
        message.delete(30 * 1000);
      });
    }

    let selfProfile = await UserProfile.findOne({ where: { userID: msg.author.id } });
    if (!selfProfile) selfProfile = await UserProfile.create({ userID: msg.author.id });
    let currentRank = selfProfile.rank;
    if (currentRank < 2) return msg.reply('You must be rank 2 before you can give rep!');

    let memberProfile = await UserProfile.findOne({ where: { userID: msg.author.id } });
    if (!memberProfile) memberProfile = await UserProfile.create({ userID: msg.author.id });

    let rep = memberProfile.rep;
    rep++;
    memberProfile.rep = rep;
    await memberProfile.save().catch(console.error);
    await Currency.removeBalance(msg.author.id, 5);
    Redis.db.setAsync(`rep${msg.author.id}`, Date.now());
    Redis.db.expire(`rep${msg.author.id}`, 24 * 60 * 60);
    return msg.reply(`you've successfully given a reputation point to ${member.displayName}.`);
  }
};
