const { Command } = require('discord.js-commando');
const request = require('request-promise');
const { version } = require('../../package.json');
const guildSettings = require('../../models/GuildSettings');

module.exports = class CatgirlCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'catgirl',
      aliases: ['catgirls', 'neko', 'nekos', 'nya', 'nyaa'],
      group: 'anime',
      memberName: 'catgirl',
      description: 'Posts a random catgirl.',
      details: 'Posts a random catgirl. Add `-nsfw` to the command to get nsfw pictures.',
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'sfw',
          prompt: 'would you like to see NSFW pictures?\n',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  /* Command will be deleted soon */
  async run(msg, { sfw }) {
    const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
    if (!settings) return msg.channel.send('NSFW is disabled for this server.');
    const nsfw = settings.nsfw;
    if (!nsfw || !nsfw.enabled || !nsfw.channels) return msg.channel.send('NSFW is disabled for this server.');
    if (!nsfw.channels.includes(msg.channel.id)) return msg.channel.send('NSFW is disabled for this channel.');

    const response = await request({
      uri: `http://catgirls.brussell98.tk/api${sfw === '-nsfw' ? '/nsfw' : ''}/random`,
      headers: { 'User-Agent': `D.Va Bot v${version} (https://github.com/Archangelius/D.VaBot)` },
      json: true
    });
    return msg.embed({
      color: 2817834,
      author: {
        name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
		  icon_url: msg.author.displayAvatarURL // eslint-disable-line
      },
      image: { url: response.url }
    });
  }
};