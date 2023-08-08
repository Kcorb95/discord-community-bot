const commando = require('discord.js-commando');
let axios = require('axios');
let winston = require('winston');

module.exports = class CuddleCommand extends commando.Command {
  constructor(Client) {
    super(Client, {
      name: 'cuddle',
      group: 'reactions',
      memberName: 'cuddle',
      description: 'Cuddles someone. (;cuddle @User)'
    });
  }

  async run(msg) {
    try {
      let res = await axios.get('https://rra.ram.moe/i/r', { params: { type: 'cuddle' } });
      //msg.say(`https://rra.ram.moe${res.data.path}`);
      msg.say('', { file: `https://rra.ram.moe${res.data.path}` });
    } catch (e) {
      return winston.error(e);
    }
  }
};