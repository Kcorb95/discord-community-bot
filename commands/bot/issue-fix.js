const { Command } = require('discord.js-commando');
const Issue = require('../../models/Issue');
const guildSettings = require('../../models/GuildSettings');

module.exports = class FixIssueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'issue-fix',
      aliases: ['iss-f', 'fixissue', 'issuefix', 'resolveissue', 'issueresolve'],
      group: 'bot',
      memberName: 'fix',
      description: 'Fix an issue.',

      args: [
        {
          key: 'issueID',
          prompt: 'which issue do you want to fix?\n',
          type: 'integer'
        }
      ]
    });
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  async run(msg, { issueID }) {
    const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
    const issues = settings.issues;
    if (!issues || !issues.enabled || !issues.channel) return msg.channel.send('The issue tracking channel has not been created for this server or is disabled.');

    const issuesChannel = msg.guild.channels.get(issues.channel);
    if (msg.channel.id !== issuesChannel.id) {
      return msg.embed({
        color: 14365748,
        description: `${msg.author}, this command can only be used in the issues channel.`
      });
    }

    const issue = await Issue.findById(issueID);
    if (!issue) {
      return msg.embed({
        color: 14365748,
        description: `${msg.author}, you provided an invalid issue id.`
      });
    }
    await issue.update({
      processed: true,
      processedBy: msg.author.id,
      fixed: true
    });

    await this.client.users.get(issue.discoveredBy).send({
      embed: {
        color: 2817834,
        author: {
          name: 'Issue fixed',
			icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
        },
        description: 'Your issue has been reviewed and fixed!',
        fields: [
          {
            name: 'Your issue:',
            value: issue.issue.length <= 1024 ? issue.issue : `${issue.issue.substr(0, 1021)}...`
          }
        ]
      }
    });

    return msg.embed({ color: 2817834, description: `${msg.author}, successfully fixed issue #${issue.id}!` })
      .then(async() => {
        const messages = await msg.channel.fetchMessages({ after: msg.id });
        const issueMessage = await msg.channel.fetchMessage(issue.issueMessage);
        messages.deleteAll();
        msg.delete();
        issueMessage.delete();
      });
  }
};