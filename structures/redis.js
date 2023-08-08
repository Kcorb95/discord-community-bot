const {promisifyAll} = require('tsubaki');
const redisClient = require('redis');
const winston = require('winston');

const {REDIS} = require('../settings.json');

promisifyAll(redisClient.RedisClient.prototype);
promisifyAll(redisClient.Multi.prototype);

const redis = redisClient.createClient(REDIS);

class Redis {
    static get db() {
        return redis;
    }

    static start() {
        redis.on('error', error => winston.error(`[REDIS]: Encountered error: \n${error}`))
            .on('reconnecting', () => winston.warn('[REDIS]: Reconnecting...'));
    }
}

module.exports = Redis;