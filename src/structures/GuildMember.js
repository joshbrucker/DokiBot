const GuildMemberModel = require(global.__basedir + "/database/models/GuildMemberModel.js");

class GuildMember extends GuildMemberModel {
  constructor(id, guildId, insultNotify, ignoreMe, disableSlashWarning) {
    super(id, guildId, insultNotify, ignoreMe, disableSlashWarning);
  }
}

module.exports = GuildMember;
