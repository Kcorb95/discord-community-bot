const Starboard = require('../structures/stars/StarBoard');

exports.run = async (bot, reaction, user) => {
    if (reaction.emoji.name !== '⭐') return;
    const { message } = reaction;
    const starboard = message.guild.channels.find('name', 'starboard');
    if (!starboard) {
        return message.channel.send({ // eslint-disable-line consistent-return
            embed: {
                color: 3447003,
                description: `${user}, can't star things without a #starboard...`
            }
        });
    }
    const isAuthor = await Starboard.isAuthor(message.id, user.id);
    if (isAuthor || message.author.id === user.id) return;
    const hasStarred = await Starboard.hasStarred(message.id, user.id);
    if (hasStarred) return; // eslint-disable-line consistent-return
    const isStarred = await Starboard.isStarred(message.id);
    if (isStarred) return Starboard.addStar(message, starboard, user.id); // eslint-disable-line
    const member = await message.guild.members.get(user.id);
    const hasPerm = await member.hasPermission('MANAGE_MESSAGES');
    if (hasPerm) Starboard.createStar(message, starboard, user.id);
};
