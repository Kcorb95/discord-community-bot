const { Command } = require('discord.js-commando');
const Starboard = require('../../structures/stars/StarBoard');

module.exports = class DeleteStarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete-star',
      aliases: ['star-delete', 'star-del', 'del-star'],
      group: 'starboard',
      memberName: 'delete',
      description: 'Add a message to the #starboard!',
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'What message would you like to star?',
          type: 'message'
        }
      ]
    });
  }

  hasPermission(msg) {
      return this.client.isOwner(msg.author) || msg.member.permissions.has('MANAGE_MESSAGES');
  }

  async run(msg, { message }) {
    const starboard = msg.guild.channels.find('name', 'starboard');
    if (!starboard) {
      return msg.embed({
        color: 3447003,
        description: `${msg.author}, you can't delete stars if you don't even have a starboard.`
      });
    }
    const isStarred = await Starboard.isStarred(message.id);
    if (!isStarred) {
      return msg.embed({ color: 14365748, description: `${msg.author}, that message is not on the #starboard.` });
    }
    await Starboard.removeStar(message, starboard);
    return msg.embed({
      color: 2817834,
      description: `${msg.author}, successfully delete the message from the starboard`
    });
  }
};
