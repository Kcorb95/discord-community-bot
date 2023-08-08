const commando = require('discord.js-commando');
let axios = require('axios');
let winston = require('winston');

module.exports = class SlapCommand extends commando.Command {
  constructor(Client) {
    super(Client, {
      name: 'slap',
      group: 'reactions',
      memberName: 'slap',
      description: 'Slaps someone. (;slap @User)'
    });
  }

  async run(msg) {
    try {
      let res = await axios.get('https://rra.ram.moe/i/r', { params: { type: 'slap' } });
      //msg.say(`https://rra.ram.moe${res.data.path}`);
      msg.say('', { file: `https://rra.ram.moe${res.data.path}` });
    } catch (e) {
      return winston.error(e);
    }
  }
};