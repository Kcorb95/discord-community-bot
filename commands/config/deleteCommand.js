const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');
const Redis = require('../../structures/redis');

module.exports = class DeleteCommandCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'deletecommand',
      group: 'config',
      aliases: ['deletecmd', 'removecmd', 'removecommand'],
      memberName: 'deletecommand',
      description: 'Deletes a custom command from the server.',
      guildOnly: true,
      examples: [
        'deletecommand say'
      ],
      args: [
        {
          key: 'name',
          prompt: 'Please enter the name of the custom command to delete.',
          type: 'string'
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.author.id === this.client.options.owner;
  }

  async run(msg, args) {
    const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
    let customcommands = settings.customcommands;
    if (!customcommands[args.name]) return msg.reply(`The command \`${args.name}\` does not exist!`);
    delete customcommands[args.name];
    settings.customcommands = customcommands;
    await Redis.db.delAsync(`customcommand${msg.guild.id}${args.name}`).catch(console.error);
    await settings.save().catch(console.error);
    return msg.reply(`The command \`${args.name}\` has been successfully removed.`);
  }
};
