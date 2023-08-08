const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');

module.exports = class SetAdminRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setmod',
      group: 'config',
      aliases: ['mod'],
      memberName: 'setmod',
      description: 'Sets the role to be used for the mod role.',
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
    if (!settings) settings = await guildSettings.create({ guildID: msg.guild.id }).catch(winston.error);
    let staffRoles = settings.staffRoles;
    staffRoles.mod = args.role.id;
    settings.staffRoles = staffRoles;
    await settings.save().catch(winston.error);
    return msg.reply(`I have successfully set ${args.role} (${settings.staffRoles.mod}) as the role for the mod.`);
  }
};