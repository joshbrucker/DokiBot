const { runQuery } = require("../db.js");
const Cache = require(__basedir + "/cache/Cache.js");

class GuildMemberModel {
  constructor(id, guildId, insultNotify, ignoreMe, disableSlashWarning) {
    this.id = id;
    this.guildId = guildId;
    this.insultNotify = insultNotify;
    this.ignoreMe = ignoreMe;
    this.disableSlashWarning = disableSlashWarning;

    this.cacheKey = Cache.getGuildMemberKey(this.id, this.guildId);
  }

  async updateInsultNotify(insultNotify) {
    this.insultNotify = insultNotify;
    await runQuery(`UPDATE guild_member SET insult_notify=? WHERE id=? AND guild_id=?;`, [ insultNotify, this.id, this.guildId ]);
    Cache.del([this.cacheKey]);
  }

  async updateIgnoreMe(ignoreMe) {
    this.ignoreMe = ignoreMe;
    await runQuery(`UPDATE guild_member SET ignore_me=? WHERE id=? AND guild_id=?;`, [ ignoreMe, this.id, this.guildId ]);
    Cache.del([this.cacheKey]);
  }

  async updateDisableSlashWarning(disableSlashWarning) {
    this.insultNotify = disableSlashWarning;
    await runQuery(`UPDATE guild_member SET disable_slash_warning=? WHERE id=? AND guild_id=?;`, [ disableSlashWarning, this.id, this.guildId ]);
    Cache.del([this.cacheKey]);
  }
}

module.exports = GuildMemberModel;
