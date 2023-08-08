const Currency = require('./Currency');
const Redis = require('../redis');

const DAY_DURATION = 24 * 60 * 60;

module.exports = class Trade {
	static async canSend(userID) {
		const totalSent = await this.totalSent(userID);
		return totalSent < 50;
	}

	static async canReceive(userID) {
		const totalReceived = await this.totalReceived(userID);
		return totalReceived < 50;
	}

	static async totalSent(userID) {
		const todaySent = await Redis.db.getAsync(`given${userID}`) || 0;
		if (!todaySent) return 0;
		return todaySent;
	}

	static async totalReceived(userID) {
		const todayReceived = await Redis.db.getAsync(`received${userID}`) || 0;
		if (!todayReceived) return 0;
		return todayReceived;
	}

	static async nextGive(userID) {
		return await new Promise((resolve, reject) => {
			Redis.db.ttl(`given${userID}`, (err, ttl) => {
				if (err) reject(console.error(err));
				resolve(ttl * 1000);
			});
		});
	}

	static async nextReceive(userID) {
		return await new Promise((resolve, reject) => {
			Redis.db.ttl(`received${userID}`, (err, ttl) => {
				if (err) reject(console.error(err));
				resolve(ttl * 1000);
			});
		});
	}

	static async updateGiven(userID, amount) {
		const todayGiven = await Redis.db.getAsync(`given${userID}`) || 0;
		let nextGiven = await this.nextGive(userID);
		if (nextGiven === -1000 || nextGiven === -2000) nextGiven = 0;
		await Redis.db.setAsync(`given${userID}`, parseInt(todayGiven) + parseInt(amount));
		if (nextGiven === 0) {
			await Redis.db.expire(`given${userID}`, DAY_DURATION);

		} else {
			await Redis.db.expire(`given${userID}`, nextGiven / 1000);
		}
	}

	static async updateReceived(userID, amount) {
		const todayReceived = await Redis.db.getAsync(`received${userID}`) || 0;
		let nextReceive = await this.nextReceive(userID);
		if (nextReceive === -1000 || nextReceive === -2000) nextReceive = 0;
		await Redis.db.setAsync(`received${userID}`, parseInt(todayReceived) + parseInt(amount));
		if (nextReceive === 0) {
			await Redis.db.expire(`received${userID}`, DAY_DURATION);

		} else {
			await Redis.db.expire(`received${userID}`, nextReceive / 1000);
		}
	}
};
