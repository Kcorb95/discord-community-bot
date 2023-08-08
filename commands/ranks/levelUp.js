const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');
const userProfile = require('../../models/UserProfile');
const Currency = require('../../structures/currency/Currency');

module.exports = class LevelUpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'levelup',
      group: 'ranks',
      aliases: ['rankup', 'promote'],
      memberName: 'levelup',
      description: 'Ranks up',
      guildOnly: true
    });
  }

  async run(msg) {
    let settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
    if (!settings) settings = await guildSettings.create({ guildID: msg.guild.id }).catch(winston.error);
    let profile = await userProfile.findOne({ where: { userID: msg.author.id } });
    if (!profile) profile = await userProfile.create({ userID: msg.author.id });
    const ranks = await settings.ranks;
    const currentRank = await profile.rank;
    if (currentRank === 0) return msg.reply('You must be a member before you can rank up!');
    if (currentRank - 1 >= ranks.length) return msg.reply(`You are already the max level ya dingus`);
    const balance = await Currency.getBalance(msg.author.id);
    const nextRank = ranks[profile.rank - 1];
    if (!nextRank || balance < nextRank.cost) return msg.reply(`You don't have enough ${Currency.textPlural} to buy this rank. (${nextRank.cost} required, you have ${balance})`);
    await msg.guild.members.get(msg.author.id).addRole(nextRank.role);
    await Currency.removeBalance(msg.author.id, nextRank.cost);
    await profile.rank++;
    await profile.save().catch(winston.error);
    await msg.reply(`OOOOOHH LEVEL UP SOOOOON!!`);
      return msg.channel.send(`**New Rank:** ${msg.guild.roles.get(ranks[profile.rank - 2].role).name}`);
  }
};