const { Command } = require('discord.js-commando');
const colors = require('../../assets/_data/colors.json');
module.exports = class ResumeSongCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'resume',
            group: 'music',
            memberName: 'resume',
            description: 'Resumes the currently playing song.',
            details: 'Only moderators may use this command.',
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3
            }
        });
    }

	hasPermission(msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
	}

    run(msg) {
        const queue = this.queue.get(msg.guild.id);
        if (!queue) {
            return msg.embed({
                color: colors.blue,
                description: `${msg.author}, there isn't any music playing to resume, oh brilliant one.`
            });
        }
        if (!queue.songs[0].dispatcher) {
            return msg.embed({
                color: colors.blue,
                description: `
				${msg.author}, pretty sure a song that hasn't actually begun playing yet could be considered "resumed".`
            });
        }
        if (queue.songs[0].playing) {
            return msg.embed({
                color: colors.blue,
                description: `${msg.author}, Resuming a song that isn't paused is a great move. Really fantastic.`
            });
        }
        queue.songs[0].dispatcher.resume();
        queue.songs[0].playing = true;
        return msg.embed({
            color: colors.green,
            description: `${msg.author}, resumed the music. This party ain't over yet!`
        });
    }

    get queue() {
        if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;
        return this._queue;
    }
};