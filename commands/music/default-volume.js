const { Command } = require('discord.js-commando');
const colors = require('../../assets/_data/colors.json');
const { DEFAULT_VOLUME } = require('../../settings.json');

module.exports = class DefaultVolumeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'default-volume',
            group: 'music',
            memberName: 'default-volume',
            description: 'Shows or sets the default volume level.',
            format: '[level|"default"]',
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3
            }
        });
    }

    hasPermission(msg) {
		return this.client.isOwner(msg.author);
    }

    run(msg, args) {
        if (!args) {
            const defaultVolume = this.client.provider.get(msg.guild.id, 'defaultVolume', DEFAULT_VOLUME);
            return msg.embed({
                color: colors.blue,
                description: `${msg.author}, the default volume level is ${defaultVolume}.`
            });
        }

        if (args.toLowerCase() === 'default') {
            this.client.provider.remove(msg.guild.id, 'defaultVolume');
            return msg.embed({
                color: colors.green,
                description: `
				${msg.member}, set the default volume level to the bot's default (currently ${DEFAULT_VOLUME}).`
            });
        }

        const defaultVolume = parseInt(args);
        if (isNaN(defaultVolume) || defaultVolume <= 0 || defaultVolume > 10) {
            return msg.embed({
                color: colors.red,
                description: `${msg.author}, invalid number provided. It must be in the range of 0-10.`
            });
        }

        this.client.provider.set(msg.guild.id, 'defaultVolume', defaultVolume);
        return msg.embed({
            color: colors.green,
            description: `${msg.author}, set the default volume level to ${defaultVolume}.`
        });
    }
};