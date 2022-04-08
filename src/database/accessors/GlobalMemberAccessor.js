const { runQuery } = require("../db.js");
const Cache = require(__basedir + "/cache/Cache.js");
const GlobalMember = require(__basedir + "/structures/GlobalMember.js");

const GlobalMemberAccessor = {
  async get(memberId) {
    let data = await Cache.get(Cache.getGlobalMemberKey(memberId), async () => {
      let res = await runQuery(`SELECT * FROM global_member WHERE id=?;`, [ memberId ]);

      if (res === null || res.length === 0) {
        await this.add(memberId);
        res = await runQuery(`SELECT * FROM global_member WHERE id=?;`, [ memberId ]);
      }

      return res;
    });

    if (data && data.length > 0) {
      return new GlobalMember(data[0].id, data[0].next_submit_date);
    }

    return null;
  },

  async add(memberId) {
    await runQuery(`INSERT INTO global_member (id) VALUES (?) ON DUPLICATE KEY UPDATE id=id;`, [ memberId ]);
  },

  async remove(memberId) {
    await runQuery(`DELETE FROM global_member WHERE id=?;`, [ memberId ]);
    Cache.del([Cache.getGlobalMemberKey(memberId)]);
  },
};

module.exports = GlobalMemberAccessor;
