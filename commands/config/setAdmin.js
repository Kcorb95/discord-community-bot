const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');

module.exports = class SetAdminRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setadmin',
      group: 'config',
      aliases: ['admin'],
      memberName: 'setadmin',
      description: 'Sets the role to be used for the admin role.',
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
    staffRoles.admin = args.role.id;
    settings.staffRoles = staffRoles;
    await settings.save().catch(winston.error);
    return msg.reply(`I have successfully set ${args.role} (${settings.staffRoles.admin}) as the role for the admin.`);
  }
};