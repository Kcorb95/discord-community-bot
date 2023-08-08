const { Command } = require('discord.js-commando');

module.exports = class CowsayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cowsay',
      group: 'textedit',
      memberName: 'cowsay',
      description: 'Converts text to cowsay. (;cowsay This text)',
      examples: [';cowsay This text'],
      args: [{
        key: 'text',
        prompt: 'What text would you like the cow to say?',
        type: 'string',
        validate: text => {
          if (text.length < 1500) {
            return true;
          }
          return 'Your message content is too long.';
        }
      }]
    });
  }

  run(message, args) {
    const text = args.text;
    return message.code(null, `< ${text} >\n       \\   ^__^\n        \\  (oO)\\_______\n           (__)\\       )\\/\\\n             U  ||----w |\n                ||     ||`);
  }
};