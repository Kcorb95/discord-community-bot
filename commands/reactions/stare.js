const commando = require('discord.js-commando');
let axios = require('axios');
let winston = require('winston');

module.exports = class StareCommand extends commando.Command {
  constructor(Client) {
    super(Client, {
      name: 'stare',
      group: 'reactions',
      memberName: 'stare',
      description: 'Stares at someone. (;stare @User)'
    });
  }

  async run(msg) {
    try {
      let res = await axios.get('https://rra.ram.moe/i/r', { params: { type: 'stare' } });
      //msg.say(`https://rra.ram.moe${res.data.path}`);
      msg.say('', { file: `https://rra.ram.moe${res.data.path}` });
    } catch (e) {
      return winston.error(e);
    }
  }
};