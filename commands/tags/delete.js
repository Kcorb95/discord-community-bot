const { Command } = require('discord.js-commando');
const Tag = require('../../models/Tag');

module.exports = class TagDeleteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete-tag',
      aliases: [
        'tag-delete',
        'tag-del',
        'tag-example-delete',
        'tag-example-del',
        'tag-server-del',
        'tag-servertag-del',
        'delete-example',
        'delete-servertag',
        'delete-server',
        'example-delete',
        'servertag-delete',
        'server-delete',
        'del-tag',
        'del-example',
        'del-servertag',
        'del-server',
        'servertag-del',
        'server-del',
        'example-del'
      ],
      group: 'tags',
      memberName: 'delete',
      description: 'Deletes a tag.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'name',
          label: 'tagname',
          prompt: 'what tag would you like to delete?\n',
          type: 'string',
          parse: str => str.toLowerCase()
        }
      ]
    });
  }

  async run(msg, { name }) {
    const staffRole = this.client.isOwner(msg.author) || msg.client.funcs.isStaff(msg.member);
    const tag = await Tag.findOne({ where: { name, guildID: msg.guild.id } });
    if (!tag) {
      return msg.embed({
        color: 14365748,
        description: `A tag with the name **${name}** doesn't exist, ${msg.author}`
      });
    }

    if (tag.userID !== msg.author.id && !staffRole) {
      return msg.embed({
        color: 14365748,
        description: `You can only delete your own tags, ${msg.author}`
      });
    }
    Tag.destroy({ where: { name, guildID: msg.guild.id } });
    return msg.embed({
      color: 2817834,
      description: `The tag **${name}** has been deleted, ${msg.author}`
    });
  }
};