const Currency = require('./Currency');
const Redis = require('../redis');

// Rate * convert to decimal
const FIXED_INTEREST_RATE = 0.05;
const UPDATE_DURATION = 12 * 60 * 60 * 1000;

Redis.db.ttl('bankupdate', (err, ttl) => {
    if (err) console.error(err);
    setTimeout(() => Bank.applyInterest(), Math.max(0, ttl * 1000));
});

class Bank {
    static changeLedger(user, amount) {
        Redis.db.hgetAsync('ledger', user).then(async balance => {
            const bal = parseInt(balance) || 0;
            await Redis.db.hsetAsync('ledger', user, amount + parseInt(bal));
        });
    }

    static async getBalance(user) {
        const balance = await Redis.db.hgetAsync('ledger', user) || 0;

        return parseInt(balance);
    }

    static deposit(user, amount) {
        Currency.removeBalance(user, amount);
        this.changeLedger(user, amount);
    }

    static withdraw(user, amount) {
        Currency.addBalance(user, amount);
        this.changeLedger(user, -amount);
    }

    static async applyInterest() {
        const interestRate = await this.getInterestRate();
        const bankBalance = await Currency.getBalance('bank');

        Redis.db.hgetallAsync('ledger').then(async balances => {
            if (!balances) return;

            for (const [user, balance] of Object.entries(balances)) {
                /* eslint-disable no-await-in-loop */
                let earnedInterest = await Math.round(balance * interestRate);
                if (earnedInterest > 25) earnedInterest = 25;
                await Redis.db.hsetAsync('ledger', user, parseInt(balance) + earnedInterest);
            }
        });

        await Redis.db.setAsync('lastbankbalance', bankBalance);
        await Redis.db.setAsync('bankupdate', Date.now());
        await Redis.db.expire('bankupdate', UPDATE_DURATION / 1000);

        setTimeout(() => Bank.applyInterest(), UPDATE_DURATION);
    }

    static async getInterestRate() {
        return parseFloat(FIXED_INTEREST_RATE);
    }

    static async nextUpdate() {
        return await new Promise((resolve, reject) => {
            Redis.db.ttl('bankupdate', (err, ttl) => {
                if (err) reject(console.error(err));
                resolve(ttl * 1000);
            });
        });
    }
}

module.exports = Bank;
