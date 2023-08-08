const {Command} = require('discord.js-commando');
const Request = require('../../models/Request');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ApproveRequestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'request-approve',
            aliases: ['req-a', 'requestapprove', 'approverequest'],
            group: 'bot',
            memberName: 'request-approve',
            description: 'Approve a requested feature.',
            args: [
                {
                    key: 'requestID',
                    prompt: 'which feature request do you want to approve?\n',
                    type: 'integer'
                },
                {
                    key: 'reason',
                    prompt: 'why has this feature been approved?\n',
                    type: 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    async run(msg, {requestID, reason}) {
        const settings = await guildSettings.findOne({where: {guildID: msg.guild.id}}) || await guildSettings.create({guildID: msg.guild.id});
        const requests = settings.requests;
        if (!requests || !requests.enabled || !requests.channel) return msg.channel.send('The requests channel has not been created for this server or is disabled.');

        const requestsChannel = msg.guild.channels.get(requests.channel);
        if (msg.channel.id !== requestsChannel.id) {
            return msg.embed({
                color: 14365748,
                description: `${msg.author}, this command can only be used in the requests channel.`
            });
        }

        const request = await Request.findById(requestID);
        if (!request) {
            return msg.embed({
                color: 3463988,
                description: `${msg.author}, you provided an invalid request id.`
            });
        }
        await request.update({
            processed: true,
            processedBy: msg.author.id,
            approved: true
        });

        await this.client.users.get(request.requester).send({
            embed: {
                color: 2817834,
                author: {
                    name: 'Request approved',
					icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
                },
                description: `Your request has been reviewed and approved!\nReason: ${reason}`,
                fields: [
                    {
                        name: 'Your request:',
                        value: request.request.length <= 1024 ? request.request : `${request.request.substr(0, 1021)}...`
                    }
                ]
            }
        });

        return msg.embed({
            color: 2817834,
            description: `${msg.author}, successfully approved request #${request.id}!`
        })
            .then(async () => {
                const messages = await msg.channel.fetchMessages({after: msg.id});
                const requestMessage = await msg.channel.fetchMessage(request.requestMessage);
                messages.deleteAll();
                msg.delete();
                requestMessage.delete();
            });
    }
};