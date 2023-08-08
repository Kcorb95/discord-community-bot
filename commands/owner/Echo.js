const { Command } = require('discord.js-commando');

module.exports = class EchoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'echo',
      group: 'owner',
      memberName: 'echo',
      description: 'Echos text back',
      details: `Echos text back`,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },

      args: [
        {
          key: 'text',
          prompt: 'what text should be echoed?\n',
          type: 'string'
        }
      ]
    });
  }

  hasPermission(msg) {
    return msg.author.id === this.client.options.owner;
  }

  async run(msg, args) {
    msg.reply(args.text);
  }
};