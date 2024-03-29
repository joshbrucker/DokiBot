const NodeCache = require("node-cache");

class CacheService {

  constructor(ttlSeconds) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
  }

  async get(key, storeFunction) {
    const value = this.cache.get(key);
    if (value) {
      return value;
    }

    const result = await storeFunction();

    this.cache.set(key, result);
    return result;
  }

  del(keys) {
    this.cache.del(keys);
  }

  delStartWith(startStr="") {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key);
      }
    }
  }

  flush() {
    this.cache.flushAll();
  }

  getRawCache() {
    return this.cache;
  }
}


module.exports = CacheService;