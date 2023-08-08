const commando = require('discord.js-commando');
let winston = require('winston');
let request = require('request');

module.exports = class DogCommand extends commando.Command {
  constructor(Client) {
    super(Client, {
      name: 'dog',
      group: 'reactions',
      memberName: 'dog',
      description: 'bork bork bork'
    });
  }

  async run(msg) {
    request.get('http://random.dog/woof', (err, response, body) => {
      if (err) return winston.info(err);
      msg.say(`http://random.dog/${body}`);
    });
  }
};