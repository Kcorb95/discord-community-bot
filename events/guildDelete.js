exports.run = (bot, server) => {
  if (!server.available) return;
  // bot.funcs.logEvent(bot, 'guildDelete');
    bot.channels.get('189630078206869505').send(`Left ${server.name} (${server.id})`);
};