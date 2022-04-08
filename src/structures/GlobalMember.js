const GlobalMemberModel = require(__basedir + "/database/models/GlobalMemberModel.js");

class GlobalMember extends GlobalMemberModel {
  constructor(id, nextSubmitDate) {
    super(id, nextSubmitDate);
  }
}

module.exports = GlobalMember;
