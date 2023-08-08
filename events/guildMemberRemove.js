const guildSettings = require('../models/GuildSettings');

exports.run = async(bot, member) => {
  // leaves/kicks
  const settings = await guildSettings.findOne({ where: { guildID: member.guild.id } });
  if (!settings) return;
  // bot.funcs.logEvent(bot, 'guildMemberRemove');
  const logs = settings.logs;
  const rolestate = settings.rolestate;
  // const mentions = settings.mentions;
  const leave = settings.leave;
  const bans = await member.guild.fetchBans().catch(() => null);

  if (logs && logs.enable && logs.channel && (logs.fields ? logs.fields.leaves !== false : !logs.fields) && (bans && !bans.has(member.id)) && member.guild.channels.has(logs.channel)) {
    const embed = new bot.methods.Embed()
      .setColor('#ff5050')
      .setTimestamp()
		.setAuthor(`${member.user.username} (${member.user.id})`, member.user.displayAvatarURL)
		.setFooter(bot.user.username, bot.user.displayAvatarURL);
      await member.guild.channels.get(logs.channel).send({embed});

  }

  if (leave && leave.enabled === true && leave.channel && member.guild.channels.has(leave.channel)) {
    await member.guild.channels.get(leave.channel).send(leave.message.replace(/USER/g, member.displayName));
  }

  // rolestate
  if (rolestate && rolestate.enabled) {
      if (!bans) return member.guild.owner.send(`\uD83D\uDEAB I do not have access to the banned members of server: \`${member.guild.name}\`. Please give me the \`ban members\` or \`administrator\` permission for rolestate to work!`); // eslint-disable-line consistent-return
    if (bans.has(member.id)) return;
    if (!rolestate.users) rolestate.users = {};
    rolestate.users[member.id] = member.roles.map(role => role.id);
    settings.rolestate = rolestate;
    await settings.save();
  }
};