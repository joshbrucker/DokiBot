const CacheService = require("./CacheService.js");

class Cache extends CacheService {
  constructor(ttlSeconds) {
    super(ttlSeconds);
  }

  getGlobalMemberKey(memberId) {
    return `globalMember_${memberId}`;
  }

  getGuildKey(guildId) {
    return `guild_${guildId}`;
  }

  getGuildMemberKey(memberId, guildId) {
    return `guildMember_${memberId}_${guildId}`;
  }
}

const ttl = 30 * 60 * 1; // Cache for 30 minutes

module.exports = new Cache(ttl);
