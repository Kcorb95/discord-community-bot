const guildSettings = require('../models/GuildSettings');
const Username = require('../models/UserName');

exports.run = async(bot, olduser, newuser) => {
  // aliases update
  if (olduser.username !== newuser.username) {
    Username.create({ userID: newuser.id, username: olduser.username }).catch(() => null);
  }
  // avatars
  for (const [, guild] of bot.guilds) {
    const settings = await guildSettings.findOne({ where: { guildID: guild.id } });
    if (!settings || newuser.bot || !guild.member(newuser.id)) continue;
    const logs = settings.logs;
    if (logs && logs.enabled && logs.channel && guild.channels.has(logs.channel)) {
      const embed = new bot.methods.Embed()
        .setTimestamp(new Date())
		  .setAuthor(`${newuser.username} (${newuser.id})`, newuser.displayAvatarURL)
		  .setFooter(bot.user.username, bot.user.displayAvatarURL);
		if ((logs.fields ? logs.fields.avatars !== false : !logs.fields) && olduser.displayAvatarURL !== newuser.displayAvatarURL) {
        embed.setColor('#0055ff');
			if (olduser.displayAvatarURL) embed.setThumbnail(olduser.displayAvatarURL);
			if (newuser.displayAvatarURL) embed.setImage(newuser.displayAvatarURL);
        embed.addField('\uD83D\uDDBC AVATAR CHANGE', `${newuser.username} has changed avatars`);
          guild.channels.get(logs.channel).send({embed});
      } else if ((logs.fields ? logs.fields.usernames !== false : !logs.fields) && olduser.username !== newuser.username) {
        embed.setColor('#0000bb').addField('\uD83D\uDD27 USERNAME CHANGE', `Old: ${olduser.username}\nNew: ${newuser.username}`);
          guild.channels.get(logs.channel).send({embed});
      }
    }
  }
};
