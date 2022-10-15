const { runQuery } = require("../db.js");
const Cache = require(global.__basedir + "/cache/Cache.js");

class GlobalMemberModel {
  constructor(id, nextSubmitDate) {
    this.id = id;
    this.nextSubmitDate = nextSubmitDate;

    this.cacheKey = Cache.getGlobalMemberKey(this.id);
  }

  async updateNextSubmitDate(date) {
    this.nextSubmitDate = date;
    await runQuery(`UPDATE global_member SET next_submit_date=? WHERE id=?;`, [ date, this.id ]);
    Cache.del([ this.cacheKey ]);
  }
}

module.exports = GlobalMemberModel;
