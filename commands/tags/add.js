const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');

const Redis = require('../../structures/redis');
const Tag = require('../../models/Tag');
const Currency = require('../../structures/currency/Currency');
const Util = require('../../functions/Util');


module.exports = class TagAddCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add-tag',
      aliases: ['tag-add'],
      group: 'tags',
      memberName: 'add',
      description: 'Adds a tag.',
      details: `Adds a tag, usable for everyone on the server. (Markdown can be used.)`,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'name',
          label: 'tagname',
          prompt: 'what would you like to name it?\n',
          type: 'string'
        },
        {
          key: 'content',
          label: 'tagcontent',
          prompt: 'what content would you like to add?\n',
          type: 'string',
          max: 1800
        }
      ]
    });
  }

  async run(msg, args) {
    const balance = await Currency.getBalance(msg.author.id);
    if (balance < 10) {
      return msg.reply(oneLine`
        you do not have enough ${Currency.textPlural} to do this,
        your current balance is ${Currency.convert(balance)}.`);
    }
    const name = Util.cleanContent(msg, args.name.toLowerCase());
    const content = Util.cleanContent(msg, args.content);
    const tag = await Tag.findOne({ where: { name, guildID: msg.guild.id } });
    if (tag) {
      return msg.embed({
        color: 14365748,
        description: `A tag with the name **${name}** already exists, ${msg.author}`
      });
    }

    await Tag.create({
      userID: msg.author.id,
      userName: `${msg.author.username}#${msg.author.discriminator}`,
      guildID: msg.guild.id,
      guildName: msg.guild.name,
      channelID: msg.channel.id,
      channelName: msg.channel.name,
      name,
      content
    });

    Redis.db.setAsync(`tag${name}${msg.guild.id}`, content);
    Currency.removeBalance(msg.author.id, 25);
    return msg.embed({
      color: 2817834,
      description: `A tag with the name **${name}** has been added, ${msg.author}`
    });
  }
};
