const { Command } = require('discord.js-commando');
const guildSettings = require('../../models/GuildSettings');
const { stripIndents } = require('common-tags');

module.exports = class ViewConfigCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'viewconfig',
      aliases: ['showconfig'],
      group: 'info',
      memberName: 'viewconfig',
      description: 'Displays configuration for the server.',
      guildOnly: true
    });
  }

  hasPermission(msg) {
    return msg.author.id === this.client.options.owner;
  }

  async run(msg) {
    const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
    if (!settings) return msg.reply('there are no settings associated with this guild...😦');
    let out = `Settings for **${msg.guild.name}**:\n`;
    // welcome messages
    if (Object.keys(settings.welcome).length > 0) {
      out += '__Welcome Messages Settings__\n';
      if (settings.welcome.public) {
        out += stripIndents`
				Public Enabled: ${settings.welcome.enabled ? 'Yes' : 'No'}
				Public Channel: ${settings.welcome.public.channel}
				Public Message: ${settings.welcome.public.message}
				`;
        out += '\n';
      }
      if (settings.welcome.private) {
        out += `Private Message: ${settings.welcome.private.message}\n`;
        if (settings.welcome.pm) {
          out += `Private Message Enabled: ${settings.welcome.pm.enabled ? 'Yes' : 'No'}\n`;
        }
        out += '\n';
      }
    }
    // leave messages
    if (Object.keys(settings.leave).length > 0) {
      out += stripIndents`
			__Leave Messages Settings__:
			Globally Enabled: ${settings.leave.enabled ? 'Yes' : 'No'}
			Private Messages Enabled: ${settings.leave.pm && settings.leave.pm.enabled ? 'Yes' : 'No'}
			Public Messages Enabled: ${settings.leave.public && settings.leave.public.enabled ? 'Yes' : 'No'}
			public channel: ${settings.leave.channel}
			`;
      out += '\n';
    }
    // logs
    if (Object.keys(settings.logs).length > 0) {
      out += stripIndents`
			__Log Settings__:
			Enabled: ${settings.logs.enabled ? 'enabled' : 'disabled'}
			Customized Fields:
			`;
      for (let field in settings.logs.fields) {
        out += `${field}: ${settings.logs.fields[field]}`;
      }
      out += '\n';
    }
    // filter
    if (Object.keys(settings.filter).length > 0 && settings.filter.words) {
      out += stripIndents`
			__Filtered Words__:
			Enabled: ${settings.filter.enabled ? 'enabled' : 'disabled'}
			${settings.filter.words.join(', ')}
			`;
      out += '\n';
    }

    // flairs
    if (Object.keys(settings.flairs).length > 0 && settings.flairs.roles) {
      out += stripIndents`
			__Self-Assignable Flairs (by command)__:
			${msg.guild.roles.filter(role => settings.flairs.roles.includes(role.id)).map(role => role.name).join(', ')}
			`;
      out += '\n';
    }
    // flairs by reaction (???)
    // show role: emojiname
    if (Object.keys(settings.reactions).length > 0 && settings.reactions.roles) {
      out += stripIndents`__Self-Assignable Flairs (by reaction)__:
			${msg.guild.roles.filter(role => settings.reactions.roles.includes(role.id)).map(role => role.name).join(', ')}
			`;
      out += '\n';
    }

    // custom commands
    if (Object.keys(settings.customcommands).length > 0) {
      out += stripIndents`__Custom Commands__:
			${Object.keys(settings.customcommands).map(cmd => `${cmd}`).join(', ')}
			`;
      out += '\n';
    }
    // nsfw
    if (Object.keys(settings.nsfw).length > 0) {
      out += stripIndents`
			__NSFW__:
			Globally Enabled: ${settings.nsfw.enabled}
			Channels Whitelisted: ${settings.nsfw.channels ? settings.nsfw.channels.map(channel => msg.guild.channels.get(channel).name).join(', ') : 'None'}
			`;
      out += '\n';
    }
    if (msg.channel.type !== 'dm') await msg.reply('I have sent you a DM with information.');
    return msg.author.send(out, { split: true });
  }
};