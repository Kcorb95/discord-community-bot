const { Command } = require('discord.js-commando');
const RESPONSES = [
  ch => `I choose **${ch}**`,
  ch => `I pick **${ch}**`,
  ch => `**${ch}** is the best choice`,
  ch => `**${ch}** is my choice`,
  ch => `**${ch}** of course`
];

module.exports = class ChooseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'choose',
      aliases: [
        'pick'
      ],
      group: 'response',
      memberName: 'choose',
      description: 'Chooses between things. (;choose "Cow" "Sheep")',
      examples: [';choose "Cow" "Sheep"', ';choose "Bark" "Woof" "Meow" "Moo"'],
      args: [
        {
          key: 'choices',
          prompt: 'what I should choose from?\n',
          type: 'string',
          infinite: true
        }
      ]
    });
  }

  async run(msg, { choices }) {
    if (choices.length < 2) {
      return msg.embed({
        color: 14365748,
        description: `You need to tell me atleast 2 things to choose from, ${msg.author}`
      });
    }

    let userError;
    choices.forEach(ch => {
      if (/[,|;|\||/|//|\-]/.test(ch) && ch.length >= 2) userError = true; // eslint-disable-line no-useless-escape
    });
    if (userError) {
      return msg.embed({
        color: 14365748,
        description: `Please seperate your choices with a simple space, ${msg.author}`
      });
    }

    let pick = Math.floor(Math.random() * choices.length);
    choices.forEach((ch, i) => {
      if ((ch.includes('homework')
        || ch.includes('sleep')
        || ch.includes('study')
        || ch.includes('productive')
        || ch.includes('shower'))
        && Math.random() < 0.3) {
        pick = i;
      }
    });

    await msg.embed({
      color: 2817834,
      description: `${RESPONSES[Math.floor(Math.random() * RESPONSES.length)](choices[pick])}, ${msg.author}.`
    });
    return null;
  }
};