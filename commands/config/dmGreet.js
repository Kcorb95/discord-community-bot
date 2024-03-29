const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ServerLogsChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dmgreet',
      group: 'config',
      memberName: 'dmgreet',
      description: 'Sets the private welcome message.',
      guildOnly: true,
      examples: [
        'privatemessage Welcome to the server, [user]!'
      ],
      args: [
        {
          key: 'message',
          prompt: 'What should the private welcome message be?\n',
          type: 'string',
          parse: (str) => {
            return str.replace(/\[user]/g, 'USER');
          }
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.author.id === this.client.options.owner;
  }

  async run(msg, args) {
    const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
    let welcome = settings.welcome;
    if (!welcome.private) welcome.private = {};
    welcome.private.message = args.message;
    settings.welcome = welcome;
    return settings.save().then(async() => {
      msg.reply(`I have successfully the new private welcome message:\n\`${args.message}\``);
    }).catch(console.error);
  }
};