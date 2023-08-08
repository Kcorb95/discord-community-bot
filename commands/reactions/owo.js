const commando = require('discord.js-commando');
let axios = require('axios');
let winston = require('winston');

module.exports = class OwOCommand extends commando.Command {
  constructor(Client) {
    super(Client, {
      name: 'owo',
      group: 'reactions',
      memberName: 'owo',
      description: 'owo'
    });
  }

  async run(msg) {
    try {
      let res = await axios.get('https://rra.ram.moe/i/r', { params: { type: 'owo' } });
      msg.say('', { file: `https://rra.ram.moe${res.data.path}` });
    } catch (e) {
      return winston.error(e);
    }
  }
};