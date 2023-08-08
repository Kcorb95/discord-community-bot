const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const guildSettings = require('../../models/GuildSettings');
const Currency = require('../../structures/currency/Currency');

module.exports = class ImRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'color',
      aliases: ['setcolor', 'givecolor', 'setcolour', 'givecolour', 'colour'],
      group: 'misc',
      memberName: 'color',
      description: 'Sets your color.',
      guildOnly: true,
      args: [
        {
          key: 'color',
          prompt: 'What color would you like to give yourself?\n',
          type: 'string',
          validate: color => {
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
          }
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.author.id === this.client.options.owner;
  }

  async run(msg, args) {
    const balance = await Currency.getBalance(msg.author.id);
    if (balance < 30) {
      return msg.reply(oneLine`
        you do not have enough ${Currency.textPlural} to do this (30 Needed),
        your current balance is ${Currency.convert(balance)}.`);
    }
    Currency.removeBalance(msg.author.id, 30);

    const oldColor = await msg.member.colorRole;
    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(oldColor.name)) {
      if (await oldColor.members.array().length === 1) {
        await oldColor.delete();
      } else {
        await msg.member.removeRole(oldColor);
      }
    }

    if (await msg.guild.roles.find('name', args.color)) {
      await msg.member.addRole(msg.guild.roles.find('name', args.color));
    }

    let settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
    if (!settings) settings = await guildSettings.create({ guildID: msg.guild.id });
    let colors = settings.colors;

    const color = await msg.guild.createRole({
      name: args.color,
      color: args.color,
      position: await msg.guild.roles.get(colors.anchorRole).position + 1,
      permissions: 0
    });
    await color.setPosition(await msg.guild.roles.get(colors.anchorRole).position - 1);
    await msg.member.addRole(color);
    return msg.reply(`You have successfully added the color, **${args.color}** to you!`);
  }
};