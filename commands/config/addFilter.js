const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');
const Redis = require('../../structures/redis');
const winston = require('winston');

module.exports = class AddFilterCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'addfilter',
      group: 'config',
      memberName: 'addfilter',
      description: 'Blacklists a word in the server.',
      guildOnly: true,
      examples: [
        'addfilter bitch'
      ],
      args: [
        {
          key: 'word',
          prompt: 'What word would you like blacklisted?\n',
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
    let filter = settings.filter;
    if (!filter.words) filter.words = [];
    if (filter.words.includes(args.word)) return msg.reply(`The word \`${args.word}\` is already blacklisted.`);
    filter.words.push(args.word);
    settings.filter = filter;
    await Redis.db.setAsync(`filter${msg.guild.id}`, JSON.stringify(filter.words)).catch(winston.error);
    await settings.save().catch(winston.error);
    return msg.reply(`The word \`${args.word}\` has been successfully added to the list of blacklisted words.`);
  }
};
