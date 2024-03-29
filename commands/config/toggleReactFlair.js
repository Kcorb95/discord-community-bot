const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ToggleReactFlairCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'togglereactflair',
      group: 'config',
      memberName: 'togglereactflair',
      description: 'Enables or disables reaction flairs.',
      guildOnly: true,
      examples: [
        'togglereactflair enable'
      ],
      args: [
        {
          key: 'enabled',
          prompt: 'Would you like to enable or disable reaction flairs?\n',
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
    let reactions = settings.reactions;
    reactions.enabled = args.enabled;
    settings.reactions = reactions;
    await settings.save().catch(console.error);
    return msg.reply(`Reaction flairs have been ${args.enabled ? 'enabled' : 'diabled'}.`);
  }
};