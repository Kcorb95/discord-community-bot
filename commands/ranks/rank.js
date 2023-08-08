const { Command } = require('discord.js-commando');
const winston = require('winston');

const guildSettings = require('../../models/GuildSettings');
const userProfile = require('../../models/UserProfile');

module.exports = class LevelUpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rank',
      group: 'ranks',
      aliases: ['level'],
      memberName: 'rank',
      description: 'Checks current rank',
      guildOnly: true
    });
  }

  async run(msg) {
    let settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
    if (!settings) settings = await guildSettings.create({ guildID: msg.guild.id }).catch(winston.error);
    let profile = await userProfile.findOne({ where: { userID: msg.author.id } });
    if (!profile) profile = await userProfile.create({ userID: msg.author.id });
    const ranks = settings.ranks;
    const currentRank = profile.rank;
    if (currentRank === 0) return msg.reply('You are too new to have a rank!');
    if (currentRank === 1) return msg.reply('You have no rank!');
    if (currentRank - 2 <= ranks.length) { //minus 2 to account for the auto-assign 'member' rank
      await msg.reply(`**Current Rank:** ${msg.guild.roles.get(ranks[profile.rank - 2].role).name}`);
    }
  }
};