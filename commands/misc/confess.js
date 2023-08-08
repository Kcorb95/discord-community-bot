const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');

const Currency = require('../../structures/currency/Currency');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ConfessCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'confess',
      aliases: ['confessions', 'confession'],
      group: 'misc',
      memberName: 'confess',
      description: 'Sends an anonymous confessions through D.Va',
      details: `Sends an anonymous confessions through D.Va`,
      throttling: {
        usages: 1,
        duration: 60
      },
      args: [
        {
          key: 'text',
          prompt: 'what is your confession?\n',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, args) {
    if (msg.channel.type !== 'dm') msg.delete();
    const balance = await Currency.getBalance(msg.author.id);
    if (balance < 10) {
      return msg.reply(oneLine`
        you do not have enough ${Currency.textPlural} to do this,
        your current balance is ${Currency.convert(balance)}.`).then(message => {
        msg.delete(30 * 1000);
        message.delete(30 * 1000);
      });
    }

    function hasUser(guild) {
      if (!guild.members.get(msg.author.id)) {
        return false;
      } else {
        return true;
      }
    }

    const guilds = await this.client.guilds.filterArray(hasUser);
	  //Make a TWO STEP command so the user can specify which guild they want the confession posted in. Searches guilds shared with the user and then can pick a number for the guild it goes to.
    let messages = [];
    for (let i = 0; i < guilds.length; i++) {
      const lastMessage = await guilds[i].member(msg.author).lastMessage;
      if (lastMessage !== null) messages.push(lastMessage.createdTimestamp);
    }
    const index = await messages.indexOf(Math.max.apply(null, messages));
    const guild = await guilds[index];
    if (!guild) return await msg.reply('Woops! Looks like you have not been active recently (since the last bot restart). Please send a message in the server that you want this confession sent before re-issuing the command.');
    let settings = await guildSettings.findOne({ where: { guildID: guild.id } });
    if (!settings) settings = await guildSettings.create({ guildID: guild.id });
    let confessions = settings.confessions;
    if (!confessions || !confessions.channel) return msg.reply('Please set up your confessions channel!');
    await Currency.removeBalance(msg.author.id, 10);
      guild.channels.get(confessions.channel).send(`\`Anonymous Confession:\` ${args.text}`);
  }
};