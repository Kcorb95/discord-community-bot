const { Command } = require('discord.js-commando');

const Redis = require('../../structures/redis');
const Tag = require('../../models/Tag');


module.exports = class ServerTagAddCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add-server-tag',
      aliases: ['tag-add-server', 'add-servertag', 'servertag-add', 'servertag'],
      group: 'tags',
      memberName: 'add-server',
      description: 'Adds a server tag.',
      details: `Adds a server tag, usable for everyone on the server. (Markdown can be used.)`,
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

  hasPermission(msg) {
    return msg.client.funcs.isStaff(msg.member);
  }

  async run(msg, args) {
    const name = args.name.toLowerCase();
    const content = args.content;

    let tag = await Tag.findOne({ where: { name, guildID: msg.guild.id } });
    if (tag) return msg.say(`A server tag with the name **${name}** already exists, ${msg.author}`);

    let cleanContent = content.replace(/@everyone/g, '@\u200Beveryone')
      .replace(/@here/g, '@\u200Bhere')
      .replace(/<@&[0-9]+>/g, roles => {
        let replaceID = roles.replace(/<|&|>|@/g, '');
        let role = msg.channel.guild.roles.get(replaceID);
        return `@${role.name}`;
      })
      .replace(/<@!?[0-9]+>/g, user => {
        let replaceID = user.replace(/<|!|>|@/g, '');
        let member = msg.channel.guild.members.get(replaceID);
        return `@${member.user.username}`;
      });

    return Tag.sync()
      .then(() => {
        Tag.create({
          userID: msg.author.id,
          userName: `${msg.author.username}#${msg.author.discriminator}`,
          guildID: msg.guild.id,
          guildName: msg.guild.name,
          channelID: msg.channel.id,
          channelName: msg.channel.name,
          name: name,
          content: cleanContent,
          type: true
        });

        Redis.db.setAsync(`tag${name}${msg.guild.id}`, cleanContent);

        return msg.say(`A server tag with the name **${name}** has been added, ${msg.author}`);
      });
  }
};
