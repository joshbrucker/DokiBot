const GuildMemberModel = require(__basedir + "/database/models/GuildMemberModel.js");

class GuildMember extends GuildMemberModel {
  constructor(id, guildId, insultNotify) {
    super(id, guildId, insultNotify);
  }
}

module.exports = GuildMember;