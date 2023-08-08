const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');
const Redis = require('../../structures/redis');

module.exports = class ToggleAdFilterCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'toggleads',
      group: 'config',
      memberName: 'toggleads',
      description: 'Enables or disables the filter for Discord invite links.',
      guildOnly: true,
      examples: [
        'toggleads true'
      ],
      args: [
        {
          key: 'enabled',
          prompt: `Would you like to enable or disable the ad filter?`,
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
    settings.adFilter = args.enabled;
    await Redis.db.setAsync(`invitefilter${msg.guild.id}`, JSON.stringify(args.enabled)).catch(console.error);
    await settings.save().catch(console.error);
    return msg.reply(`The filtering of Discord links has been ${args.enabled ? 'enabled' : 'disabled'}.`);
  }
};
