const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ServerLogsChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'logchannel',
      group: 'config',
      memberName: 'logchannel',
      description: 'Sets the channel for server logs.',
      guildOnly: true,
      examples: [
        'logchannel evidence_dot_zip'
      ],
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
    const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
    let logs = settings.logs;
    logs.channel = args.channel.id;
    settings.logs = logs;
    await settings.save().catch(console.error);
    return msg.reply(`I have successfully set ${args.channel} as the channel for server logs.`);
  }
};