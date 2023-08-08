const { Command } = require('discord.js-commando');

module.exports = class RateWaifuCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ratewaifu',
      aliases: [
        'waifu'
      ],
      group: 'response',
      memberName: 'ratewaifu',
      description: 'Rates your Waifu. (;ratewaifu Xiao Pai)',
      examples: [';ratewaifu Xiao Pai'],
      args: [{
        key: 'waifu',
        prompt: 'Who do you want to rate?',
        type: 'member'
      }]
    });
  }

  run(message, args) {
    const { waifu } = args;
    if (waifu.id === this.client.options.owner) return message.say(`HOT DAAAAAAAMN I give ${waifu} 100000/10!!!`);
    const rating = Math.floor(Math.random() * 10) + 1;
    return message.say(`I'd give ${waifu} a ${rating}/10!`);
  }
};