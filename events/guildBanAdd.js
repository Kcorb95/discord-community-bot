const guildSettings = require('../models/GuildSettings');

exports.run = async(bot, server, user) => {

  const settings = await guildSettings.findOne({ where: { guildID: server.id } });
  if (!settings) return;
  // bot.funcs.logEvent(bot, 'guildBanAdd');
  const logs = settings.logs;
  // const mentions = bot.provider.get(server, 'mentions');
  if (logs && (logs.fields ? logs.fields.bans !== false : !logs.fields) && server.channels.has(logs.channel)) {
    const embed = new bot.methods.Embed()
      .setColor('#ff0000')
      .setTimestamp(new Date())
		.setAuthor(`${user.username} (${user.id})`, user.displayAvatarURL)
		.setFooter(bot.user.username, bot.user.displayAvatarURL);
    /* if (mentions && mentions.enabled) embed.addField('\uD83D\uDEAB FILTER BAN', `${user.username} has been banned from the server for surpassing the mention limit!`);
     else*/
    embed.addField('\uD83D\uDEAB NEW BAN', `${user.username} has been banned from the server!`);
      await server.channels.get(logs.channel).send({embed}).catch(() => null);
  }

  server = null;
  user = null;
};