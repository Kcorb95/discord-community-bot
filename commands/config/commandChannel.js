const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');

module.exports = class CommandChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'commandchannel',
      group: 'config',
      aliases: ['cc', 'dc', 'setcommand', 'setcom', 'setdva'],
      memberName: 'commandchannel',
      description: 'Sets the channel for interacting with dva.',
      guildOnly: true,
      args: [
        {
          key: 'channel',
          prompt: 'What channel would you like to set?\n',
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
    let commands = settings.commands;
    commands.channel = args.channel.id;
    settings.commands = commands;
    await settings.save().catch(winston.error);
    return msg.reply(`I have successfully set ${args.channel} (${settings.commands.channel}) as the channel for D.Va commands.`);
  }
};