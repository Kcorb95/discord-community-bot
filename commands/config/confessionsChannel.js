const { Command } = require('discord.js-commando');

const guildSettings = require('../../models/GuildSettings');

module.exports = class ConfessionsChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'confessionschannel',
      group: 'config',
      memberName: 'confessionschannel',
      description: 'Sets the channel for anonymous confessions.',
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
    if (!settings) settings = await guildSettings.create({ guildID: msg.guild.id });
    let confessions = settings.confessions;
    confessions.channel = args.channel.id;
    settings.confessions = confessions;
    await settings.save().catch(console.error);
    return msg.reply(`I have successfully set ${args.channel} as the channel for anonymous confessions.`);
  }
};