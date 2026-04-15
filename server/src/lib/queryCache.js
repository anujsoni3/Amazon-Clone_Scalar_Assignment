const { getReadyRedis } = require('./redisClient');

const cache = new Map();

const nowMs = () => Date.now();

const getCachedValue = async (key) => {
  const redis = getReadyRedis();
  if (redis) {
    try {
      const cached = await redis.get(`cache:${key}`);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch {
      // fall back to in-memory cache on transient Redis failures
    }
  }

  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= nowMs()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

const setCachedValue = async (key, value, ttlMs = 15_000) => {
  const redis = getReadyRedis();
  if (redis) {
    try {
      const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
      await redis.set(`cache:${key}`, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch {
      // fall back to in-memory cache on transient Redis failures
    }
  }

  cache.set(key, {
    value,
    expiresAt: nowMs() + ttlMs,
  });
};

const clearCacheByPrefix = async (prefix) => {
  const redis = getReadyRedis();
  if (redis) {
    try {
      const keys = await redis.keys(`cache:${prefix}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    } catch {
      // fall back to in-memory invalidation on transient Redis failures
    }
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};

module.exports = {
  getCachedValue,
  setCachedValue,
  clearCacheByPrefix,
};
