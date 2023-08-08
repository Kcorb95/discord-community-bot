const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const guildSettings = require('../../models/GuildSettings');
const Currency = require('../../structures/currency/Currency');

module.exports = class NameChangeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'name',
      aliases: ['changename', 'nickname', 'setname', 'setnickname', 'changenickname', 'nick'],
      group: 'misc',
      memberName: 'name',
      description: 'Sets your name.',
      guildOnly: true,
      args: [
        {
          key: 'name',
          prompt: 'What name would you like to give yourself?\n',
          type: 'string'
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.client.funcs.isStaff(msg.member);
  }

  async run(msg, args) {
    const balance = await Currency.getBalance(msg.author.id);
    if (balance < 5) {
      return msg.reply(oneLine`
        you do not have enough ${Currency.textPlural} to do this (5 Needed),
        your current balance is ${Currency.convert(balance)}.`);
    }
    Currency.removeBalance(msg.author.id, 5);

    await msg.member.setNickname(args.name);
    return msg.reply(`You have successfully changed your name, **${args.name}**!`);
  }
};