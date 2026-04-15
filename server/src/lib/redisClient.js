const Redis = require('ioredis');

let client = null;
let isReady = false;
let hasLoggedFallback = false;

const getRedisClient = () => {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  client = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    lazyConnect: true,
    enableReadyCheck: true,
  });

  client.on('ready', () => {
    isReady = true;
    hasLoggedFallback = false;
    console.log('Redis connected for cache and rate limiting');
  });

  client.on('error', (err) => {
    isReady = false;
    if (!hasLoggedFallback) {
      console.warn(`Redis unavailable, falling back to in-memory mode: ${err.message}`);
      hasLoggedFallback = true;
    }
  });

  client.connect().catch((err) => {
    isReady = false;
    if (!hasLoggedFallback) {
      console.warn(`Redis connect failed, using in-memory mode: ${err.message}`);
      hasLoggedFallback = true;
    }
  });

  return client;
};

const getReadyRedis = () => {
  const instance = getRedisClient();
  if (!instance || !isReady) return null;
  return instance;
};

module.exports = { getReadyRedis };
