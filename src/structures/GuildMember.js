const GuildMemberModel = require(__basedir + "/database/models/GuildMemberModel.js");

class GuildMember extends GuildMemberModel {
  constructor(id, guildId, insultNotify, disableSlashWarning) {
    super(id, guildId, insultNotify, disableSlashWarning);
  }
}

module.exports = GuildMember;
