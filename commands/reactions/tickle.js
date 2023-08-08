const commando = require('discord.js-commando');
let axios = require('axios');
let winston = require('winston');

module.exports = class TickleCommand extends commando.Command {
  constructor(Client) {
    super(Client, {
      name: 'tickle',
      group: 'reactions',
      memberName: 'tickle',
      description: 'Tickles someone. (;tickle @User)'
    });
  }

  async run(msg) {
    try {
      let res = await axios.get('https://rra.ram.moe/i/r', { params: { type: 'tickle' } });
      //msg.say(`https://rra.ram.moe${res.data.path}`);
      msg.say('', { file: `https://rra.ram.moe${res.data.path}` });
    } catch (e) {
      return winston.error(e);
    }
  }
};