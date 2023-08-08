const { Command } = require('discord.js-commando');
const Request = require('../../models/Request');
const guildSettings = require('../../models/GuildSettings');

module.exports = class RejectRequestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'request-reject',
      aliases: ['req-r', 'requestreject', 'requestdeny', 'denyrequest', 'rejectrequest'],
      group: 'bot',
      memberName: 'request-reject',
      description: 'Reject a requested feature.',
      args: [
        {
          key: 'requestID',
          prompt: 'which feature request would you like to reject?\n',
          type: 'integer'
        },
        {
          key: 'reason',
          prompt: 'why did the request get rejected?\n',
          type: 'string'
        }
      ]
    });
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  async run(msg, { requestID, reason }) {
    const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
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
      return msg.embed({ color: 14365748, description: `${msg.author}, you provided an invalid request id.` });
    }
    await request.save({
      processed: true,
      processedBy: msg.author.id,
      approved: false,
      reason
    });

    await this.client.users.get(request.requester).send({
      embed: {
        color: 14365748,
        author: {
          name: 'Request rejected',
			icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
        },
        description: reason,
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
        description: `${msg.author}, successfully rejected request #${request.id}!\nReason: ${reason}`
      })
      .then(async() => {
        const messages = await msg.channel.fetchMessages({ after: msg.id });
        const requestMessage = await msg.channel.fetchMessage(request.requestMessage);
        messages.deleteAll();
        msg.delete();
        requestMessage.delete();
      });
  }
};