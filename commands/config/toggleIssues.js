const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ToggleIssueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'toggleissues',
      group: 'config',
      memberName: 'toggleissues',
      description: 'Enables or disables issue tracking.',
      guildOnly: true,
      examples: [
        'toggleissues true'
      ],
      args: [
        {
          key: 'enabled',
          prompt: 'Would you like to enable it or disable issue tracking?\n',
          type: 'boolean'
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
    issues.enabled = args.enabled;
    settings.issues = issues;
    await settings.save();
    return msg.reply(`Issue tracking has been ${args.enabled ? 'enabled' : 'disabled'}.`);
  }
};