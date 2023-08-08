const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');

module.exports = class SetMemberRankRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'memberrank',
      group: 'config',
      aliases: ['setmember'],
      memberName: 'memberrank',
      description: 'Sets the role to be used for the member rank.',
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
    let memberRank = settings.memberRank;
    memberRank.id = args.role.id;
    settings.memberRank = memberRank;
    await settings.save().catch(winston.error);
    return msg.reply(`I have successfully set ${args.role} (${settings.memberRank.id}) as the role for the MemberRank.`);
  }
};