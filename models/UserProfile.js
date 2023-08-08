const Sequelize = require('sequelize');

const Database = require('../structures/PostgreSQL');

const UserProfile = Database.db.define('userProfiles', {
    userID: Sequelize.STRING,
    inventory: {
        type: Sequelize.STRING,
        defaultValue: '[]'
    },
    doritos: {
        type: Sequelize.BIGINT(), // eslint-disable-line new-cap
        defaultValue: 0
    },
    balance: {
        type: Sequelize.BIGINT(), // eslint-disable-line new-cap
        defaultValue: 0
    },
    networth: {
        type: Sequelize.BIGINT(), // eslint-disable-line new-cap
        defaultValue: 0
    },
    rep: {
        type: Sequelize.INTEGER(), // eslint-disable-line new-cap
        defaultValue: 0
    },
    rank: {
        type: Sequelize.INTEGER(), // eslint-disable-line new-cap
        defaultValue: 0
    },
    newMember: {
        type: Sequelize.JSONB(), // eslint-disable-line new-cap
        defaultValue: {}
    },
    personalMessage: {
        type: Sequelize.STRING,
        defaultValue: ''
    },
    background: {
        type: Sequelize.STRING,
        defaultValue: 'default'
    }
});

module.exports = UserProfile;