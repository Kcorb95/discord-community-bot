const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');

module.exports = class RankAddCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rankadd',
      group: 'ranks',
      aliases: ['addrank', 'ar', 'ra'],
      memberName: 'rankadd',
      description: 'Adds a role to the list of obtainable ranks with a cost',
      guildOnly: true,
      args: [
        {
          key: 'role',
          prompt: 'What rank would you like to add?\n',
          type: 'role'
        },
        {
          key: 'cost',
          prompt: 'How much should this rank cost?\n',
          type: 'integer'
        },
        {
          key: 'position',
          prompt: 'What position should this rank be set to?\n',
          type: 'integer'
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.author.id === this.client.options.owner;
  }

  async run(msg, args) {
    let settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
    if (!settings) settings = await guildSettings.create({ guildID: msg.guild.id }).catch(winston.error);
    let ranks = settings.ranks;
    let rank = { role: args.role.id, cost: args.cost };
    let doesExist = false;
    let index;
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i].role === args.role.id) {
        doesExist = true;
        index = i;
        i = ranks.length;
      }
    }
    if (doesExist) ranks.splice(index, 1);
    if (ranks.length <= args.position - 1) ranks.push(rank);
    else ranks.splice(args.position - 1, 0, rank);
    settings.ranks = ranks;
    await settings.save().catch(winston.error);
    await msg.reply(`Ranks: (${ranks.length})`);
    for (let i = 0; i < ranks.length; i++) {
      await msg.reply(`**Position:** ${i} **RankID:** ${settings.ranks[i].role} **RankCost:** ${settings.ranks[i].cost}`);
    }
  }
};