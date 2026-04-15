const cache = new Map();

const nowMs = () => Date.now();

const getCachedValue = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= nowMs()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

const setCachedValue = (key, value, ttlMs = 15_000) => {
  cache.set(key, {
    value,
    expiresAt: nowMs() + ttlMs,
  });
};

const clearCacheByPrefix = (prefix) => {
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
