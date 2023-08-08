const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ToggleIssueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'togglerequests',
      group: 'config',
      memberName: 'togglerequests',
      description: 'Enables or disables requests.',
      guildOnly: true,
      examples: [
        'togglerequests true'
      ],
      args: [
        {
          key: 'enabled',
          prompt: 'Would you like to enable it or disable requests?\n',
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
    let requests = settings.requests;
    requests.enabled = args.enabled;
    settings.requests = requests;
    await settings.save();
    return msg.reply(`Requests have been ${args.enabled ? 'enabled' : 'disabled'}.`);
  }
};