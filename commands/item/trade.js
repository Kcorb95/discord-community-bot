const { Command } = require('discord.js-commando');
const Currency = require('../../structures/currency/Currency');
const Inventory = require('../../structures/currency/Inventory');
const ItemGroup = require('../../structures/currency/ItemGroup');

module.exports = class ItemTradeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'item-trade',
      aliases: ['trade-items', 'trade-item', 'items-trade'],
      group: 'item',
      memberName: 'trade',
      description: `Trade items with another user.`,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'what user would you like to give your item(s)?\n',
          type: 'member'
        },
        {
          key: 'offerItem',
          prompt: 'what item would you like to trade?\n',
          type: 'string'
        },
        {
          key: 'offerAmount',
          label: 'amount of items to give',
          prompt: 'how many would you like to trade?\n',
          type: 'integer',
          min: 1
        },
        {
          key: 'receiveItem',
          prompt: 'what item would you like to receive?\n',
          type: 'string'
        },
        {
          key: 'receiveAmount',
          label: 'amount of items to receive',
          prompt: 'how many items would you like to receive?\n',
          type: 'integer',
          min: 1
        }
      ]
    });
  }

  async run(msg, args) {
    const { member, offerAmount, receiveAmount } = args;
    const offerItem = this.isDoritos(args.offerItem, offerAmount);
    const receiveItem = this.isDoritos(args.receiveItem, receiveAmount);

    if (member.id === msg.author.id) {
      return msg.embed({
        color: 3447003,
        description: `${msg.author}, giving items to yourself won't change anything.`
      });
    }
    if (member.user.bot) {
      return msg.embed({
        color: 14211540,
        description: `${msg.author}, don't give your items to bots: they're bots, man.`
      });
    }
    if (!offerItem && !receiveItem) {
      return msg.embed({
        color: 14211540,
        description: `${msg.author},you can't trade doritos for doritos.`
      });
    }

    const offerBalance = Currency.getBalance(msg.author.id);
    const receiveBalance = Currency.getBalance(member.id);
    const offerInv = Inventory.fetchInventory(msg.author.id);
    const receiveInv = Inventory.fetchInventory(member.id);
    const offerItemBalance = offerInv.content[offerItem] ? offerInv.content[offerItem].amount : null;
    const receiveItemBalance = receiveInv.content[receiveItem] ? receiveInv.content[receiveItem].amount : null;
    const offerValidation = this.validate(offerItem, offerAmount, offerBalance, offerItemBalance, 'you');
    const receiveValidation = this.validate(receiveItem, receiveAmount, receiveBalance, receiveItemBalance, member.displayName); // eslint-disable-line max-len
    if (offerValidation) return msg.embed({ color: 3447003, description: `${msg.author}, ${offerValidation}` });
    if (receiveValidation) return msg.embed({ color: 3447003, description: `${msg.author}, ${receiveValidation}` });

    const embed = {
      color: 3447003,
      title: `${msg.member.displayName} < -- > ${member.displayName}`,
      description: 'Type `accept` within the next 30 seconds to accept this trade.',
      fields: [
        {
          name: msg.member.displayName,
          value: offerItem
            ? `${offerAmount} ${offerItem}`
            : Currency.convert(offerAmount)
        },
        {
          name: member.displayName,
          value: receiveItem
            ? `${receiveAmount} ${receiveItem}`
            : Currency.convert(receiveAmount)
        }
      ]
    };

    if (!await this.response(msg, member, embed)) {
      return msg.embed({
        color: 14365748,
        description: `${msg.author}, ${member.displayName} declined or failed to respond.`
      });
    }
    if (!offerItem) this.sendDoritos(msg.author, member, offerAmount);
    else this.sendItems(offerInv, receiveInv, offerItem, offerAmount);
    if (!receiveItem) this.sendDoritos(member, msg.author, receiveAmount);
    else this.sendItems(receiveInv, offerInv, receiveItem, receiveAmount);
    return msg.embed({ color: 2817834, description: 'Trade successful.' });
  }

  validate(item, amount, balance, itemBalance, user) {
    const person = user === 'you';

    if (item) {
      if (!itemBalance) return `${user} ${person ? "don't" : "doesn't"} have any ${item}s.`;
      if (amount > itemBalance) return `${user} ${person ? 'have' : 'has'} only ${itemBalance} ${item}s.`;
    } else if (amount > balance) {
      return `${user} ${person ? 'have' : 'has'} only ${Currency.convert(balance)}`;
    }
    return null;
  }

  isDoritos(item, amount) {
    if (/doritos?/.test(item)) return null;
    return ItemGroup.convert(item, amount);
  }

  sendItems(fromInventory, toInventory, item, amount) {
    const itemGroup = new ItemGroup(item, amount);

    fromInventory.removeItems(itemGroup);
    toInventory.addItems(itemGroup);
  }

  sendDoritos(fromUser, toUser, amount) {
    Currency.removeBalance(fromUser, amount);
    Currency.addBalance(toUser, amount);
  }

  async response(msg, user, embed) {
    msg.say(`${user}, ${msg.member.displayName} wants to trade with you.`);
    msg.embed(embed);
    const responses = await msg.channel.awaitMessages(response =>
      response.author.id === user.id && response.content.toLowerCase() === 'accept',
      {
        maxMatches: 1,
        time: 30e3
      });

    if (responses.size === 0) return false;
    return true;
  }
};