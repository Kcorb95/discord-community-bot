const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');

module.exports = class GenerateCurrencyInChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'generatecurrency',
      group: 'config',
      aliases: ['gc', 'gencurrency', 'gd', 'gendoritos'],
      memberName: 'generatecurrency',
      description: 'Toggles the generation of currency for a channel (default is enabled)',
      guildOnly: true,
      args: [
        {
          key: 'channel',
          prompt: 'What channel would you like to toggle?\n',
          type: 'channel'
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
    let currency = settings.currency;
    if (!currency.channels) currency.channels = [];
    if (currency.channels.includes(args.channel.id)) currency.channels.splice(currency.channels.indexOf(args.channel.id));
    else currency.channels.push(args.channel.id);
    settings.currency = currency;
    await settings.save().catch(winston.error);
    return msg.reply(`I have ${currency.channels.includes(args.channel.id) ? 'disabled' : 'enabled'} currency generation in ${args.channel}.`);
  }
};