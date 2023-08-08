const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class IssuesChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'issueschannel',
      group: 'config',
      memberName: 'issueschannel',
      description: 'Sets the channel for issue tracking.',
      guildOnly: true,
      examples: [
        'issueschannel general'
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
    let issues = settings.issues;
    issues.channel = args.channel.id;
    settings.issues = issues;
    await settings.save().catch(console.error);
    return msg.reply(`I have successfully set ${args.channel} as the destination channel for issue tracking.`);
  }
};