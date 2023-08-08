const commando = require('discord.js-commando');
let winston = require('winston');
let moment = require('moment');

module.exports = class GarfieldCommand extends commando.Command {
  constructor(Client) {
    super(Client, {
      name: 'garfield',
      group: 'reactions',
      memberName: 'garfield',
      description: 'Mondays'
    });
  }

  async run(msg) {
    let year = this.random(1990, 2016);
    let day = this.random(0, 366);
    let date = moment().year(year).dayOfYear(day);
    let dateFormat = date.format('YYYY-MM-DD');
    let dateYear = date.year();
    msg.say(`https://d1ejxu6vysztl5.cloudfront.net/comics/garfield/${dateYear}/${dateFormat}.gif`).catch(winston.info);
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
};