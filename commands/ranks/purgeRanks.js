const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');

module.exports = class PurgeRanksCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'purgeranks',
      group: 'ranks',
      aliases: ['removefuckingranks', 'pr', 'purgeallfuckingranks'],
      memberName: 'purgeranks',
      description: 'Purges all ranks from the database',
      guildOnly: true
    });
  }

  hasPermission(msg) {
    return msg.author.id === this.client.options.owner;
  }

  async run(msg) {
    let settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
    if (!settings) {
      await msg.reply('GuildSettings table not found, creating table (purgerank.js)');
      settings = await guildSettings.create({ guildID: msg.guild.id }).catch(winston.error);
    }
    settings.ranks = [];
    await settings.save().catch(winston.error);
    return msg.reply(`Ranks fuckin purged (${settings.ranks.length})`);
  }
};