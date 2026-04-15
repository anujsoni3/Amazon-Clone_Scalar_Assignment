const { getReadyRedis } = require('../lib/redisClient');

const buckets = new Map();

const nowMs = () => Date.now();

const cleanupExpired = (timestamp) => {
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= timestamp) {
      buckets.delete(key);
    }
  }
};

const defaultKeyGenerator = (req) => `${req.ip}:${req.baseUrl || req.path}`;

const createRateLimiter = ({
  windowMs = 60_000,
  max = 120,
  keyGenerator = defaultKeyGenerator,
  message = 'Too many requests. Please try again shortly.',
} = {}) => {
  return async (req, res, next) => {
    const timestamp = nowMs();
    const key = keyGenerator(req);

    const redis = getReadyRedis();
    if (redis) {
      try {
        const redisKey = `rate:${key}`;
        const count = await redis.incr(redisKey);
        if (count === 1) {
          await redis.pexpire(redisKey, windowMs);
        }

        if (count > max) {
          const ttlMs = await redis.pttl(redisKey);
          const retryAfterSec = Math.max(1, Math.ceil((ttlMs > 0 ? ttlMs : windowMs) / 1000));
          res.setHeader('Retry-After', retryAfterSec);
          return res.status(429).json({ success: false, error: message });
        }

        return next();
      } catch {
        // fall through to in-memory limiting if Redis operation fails
      }
    }

    if (buckets.size > 20_000) {
      cleanupExpired(timestamp);
    }

    const current = buckets.get(key);

    if (!current || current.resetAt <= timestamp) {
      buckets.set(key, { count: 1, resetAt: timestamp + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - timestamp) / 1000));
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({ success: false, error: message });
    }

    return next();
  };
};

module.exports = { createRateLimiter };
