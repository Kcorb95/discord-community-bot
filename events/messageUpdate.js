const guildSettings = require('../models/GuildSettings');
const Redis = require('../structures/redis');

exports.run = async(bot, oldmsg, newmsg) => {
  if (!newmsg.guild || !newmsg.guild.available || newmsg.bot) return;
  const settings = await guildSettings.findOne({ where: { guildID: newmsg.guild.id } });
  if (!settings) return;
  // bot.funcs.logEvent(bot, 'messageUpdate');
  const logs = settings.logs;

  const words = await Redis.db.getAsync(`filter${newmsg.guild.id}`).then(JSON.parse);
  const enabled = await Redis.db.getAsync(`filterenabled${newmsg.guild.id}`).then(JSON.parse);
  if (enabled && words) {
    const member = await newmsg.guild.fetchMember(newmsg.author);
    if (!bot.funcs.isStaff(member) && bot.funcs.hasFilteredWord(words, bot.funcs.filterWord(newmsg.content))) {
      await newmsg.author.send(`Your updated message \`${newmsg.content}\` was deleted due to breaking the filter!`);
      await newmsg.delete();
    }
  }

  if (logs && logs.enabled && logs.channel && (logs.fields ? logs.fields.messages !== false : !logs.fields) && newmsg.guild.channels.has(logs.channel)) {
    if (oldmsg !== null && newmsg !== null && oldmsg.content !== newmsg.content) {
      let oldout = '', newout = '';

      if (oldmsg.content.length >= 500) oldout = `${oldmsg.cleanContent.substring(0, 500)}...`;
      else oldout = oldmsg.cleanContent;
      if (newmsg.content.length >= 500) newout = `${newmsg.cleanContent.substring(0, 500)}...`;
      else newout = newmsg.cleanContent;

      const embed = new bot.methods.Embed()
        .setColor('#ffbb00')
        .setTimestamp(new Date())
		  .setAuthor(`${oldmsg.author.username} (${oldmsg.author.id})`, oldmsg.author.displayAvatarURL)
        .addField(`\uD83D\uDCDD UPDATED MESSAGE`, `**Channel:** ${oldmsg.channel}\n**Old:** ${oldout}\n**New:** ${newout}`)
		  .setFooter(bot.user.username, bot.user.displayAvatarURL);
      if (bot.funcs.hasImage(oldmsg)) embed.addField('Old Attachment', bot.funcs.validateImageURL(oldmsg));
      if (bot.funcs.hasImage(newmsg) && (oldmsg.attachments.first().url !== newmsg.attachments.first().url)) embed.addField('New Attachment', bot.funcs.validateImageURL(newmsg));

        await newmsg.guild.channels.get(logs.channel).send({embed});
    }
  }
  newmsg = null;
  oldmsg = null;
};
