const { Command } = require('discord.js-commando');
const Issue = require('../../models/Issue');
const guildSettings = require('../../models/GuildSettings');

module.exports = class InvalidIssueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'issue-reject',
      aliases: ['iss-r', 'rejectissue', 'issuereject'],
      group: 'bot',
      memberName: 'issue-reject',
      description: 'Mark an issue as invalid/rejected.',
      args: [
        {
          key: 'issueID',
          prompt: 'which issue would you like to invalidate?\n',
          type: 'integer'
        },
        {
          key: 'reason',
          prompt: 'why do you want to mark the issue as invalid?\n',
          type: 'string'
        }
      ]
    });
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  async run(msg, { issueID, reason }) {
    const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
    const issues = settings.issues;
    if (!issues || !issues.enabled || !issues.channel) return msg.channel.send('The issue tracking channel has not been created for this server or is disabled.');

    const issuesChannel = msg.guild.channels.get(issues.channel);
    if (msg.channel.id !== issuesChannel.id) {
      return msg.embed({
        color: 3463988,
        description: `${msg.author}, this command can only be used in the issues channel.`
      });
    }

    const issue = await Issue.findById(issueID);
    if (!issue) {
      return msg.embed({
        color: 3463988,
        description: `${msg.author}, you provided an invalid issue id.`
      });
    }
    await issue.save({
      processed: true,
      processedBy: msg.author.id,
      fixed: false,
      reason
    });

    await this.client.users.get(issue.discoveredBy).send({
      embed: {
        color: 14365748,
        author: {
          name: 'Issue invalidated',
			icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
        },
        description: reason,
        fields: [
          {
            name: 'Your issue:',
            value: issue.issue.length <= 1024 ? issue.issue : `${issue.issue.substr(0, 1021)}...`
          }
        ]
      }
    });

    return msg.embed({ color: 2817834, description: `${msg.author}, successfully rejected issue #${issue.id}!` })
      .then(async() => {
        const messages = await msg.channel.fetchMessages({ after: msg.id });
        const issueMessage = await msg.channel.fetchMessage(issue.issueMessage);
        messages.deleteAll();
        msg.delete();
        issueMessage.delete();
      });
  }
};