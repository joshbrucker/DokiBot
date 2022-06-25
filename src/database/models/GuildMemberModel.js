const { runQuery } = require("../db.js");
const Cache = require(__basedir + "/cache/Cache.js");

class GuildMemberModel {
  constructor(id, guildId, insultNotify) {
    this.id = id;
    this.guildId = guildId;
    this.insultNotify = insultNotify;

    this.cacheKey = Cache.getGuildMemberKey(this.id, this.guildId);
  }

  async updateNotifyMe(insultNotify) {
    this.insultNotify = insultNotify;
    await runQuery(`UPDATE guild_member SET insult_notify=? WHERE id=? AND guild_id=?;`, [ insultNotify, this.id, this.guildId ]);
    Cache.del([this.cacheKey]);
  }
}

module.exports = GuildMemberModel;
