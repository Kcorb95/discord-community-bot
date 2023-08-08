const Sequelize = require('sequelize');

const Database = require('../structures/PostgreSQL');

const GuildSettings = Database.db.define('guildSettings', {
  guildID: Sequelize.STRING,
  customrep: Sequelize.STRING,
  customrepimage: Sequelize.STRING,
  adfilter: Sequelize.BOOLEAN,
  customcommands: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  welcome: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  leave: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  rolestate: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  flairs: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  joinflairs: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  reactions: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  filter: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  slowmode: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  logs: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  issues: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  requests: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  mentions: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  ranks: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: []
  },
  staffRoles: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  memberRank: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  confessions: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  commands: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  nsfw: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  currency: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  },
  colors: {
    type: Sequelize.JSONB(), // eslint-disable-line new-cap
    defaultValue: {}
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['guildID']
    }
  ]
});

module.exports = GuildSettings;