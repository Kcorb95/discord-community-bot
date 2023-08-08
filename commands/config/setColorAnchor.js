const { Command } = require('discord.js-commando');

const guildSettings = require('../../models/GuildSettings');

module.exports = class SetColorAnchor extends Command {
  constructor(client) {
    super(client, {
      name: 'setcoloranchor',
      group: 'config',
      memberName: 'setcoloranchor',
      description: 'Sets the role to help in positioning color roles.',
      guildOnly: true,
      args: [
        {
          key: 'role',
          prompt: 'What role would you like to set?\n',
          type: 'role'
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.author.id === this.client.options.owner;
  }

  async run(msg, args) {
    let settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
    if (!settings) settings = await guildSettings.create({ guildID: msg.guild.id }).catch(console.error);
    let colors = settings.colors;
    colors.anchorRole = args.role.id;
    settings.colors = colors;
    await settings.save().catch(console.error);
    return msg.reply(`I have successfully set ${args.role} (${settings.colors.anchorRole}) as the role for the color anchor.`);
  }
};