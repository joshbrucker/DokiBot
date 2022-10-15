const { runQuery } = require("../db.js");
const Cache = require(global.__basedir + "/cache/Cache.js");
const Guild = require(global.__basedir + "/structures/Guild.js");

const GuildAccessor = {
  async get(guildId) {
    let data = await Cache.get(Cache.getGuildKey(guildId), async () => {
      let res = await runQuery(`SELECT * FROM guild WHERE id=?;`, [ guildId ]);

      // If not found, try to add
      if (res === null || res.length === 0) {
        await this.add(guildId);
        res = await runQuery(`SELECT * FROM guild WHERE id=?;`, [ guildId ]);
      }

      return res;
    });

    if (data && data.length > 0) {
      return new Guild(data[0].id, data[0].current_poem, data[0].poem_channel, data[0].next_poem_update_time,
        data[0].poem_frequency, data[0].allow_insults, data[0].next_insult_time);
    }

    return null;
  },

  async add(guildId) {
    await runQuery(`INSERT INTO guild (id) VALUES (?) ON DUPLICATE KEY UPDATE id=id;`, [ guildId ]);
  },

  async remove(guildId) {
    await runQuery(`DELETE FROM guild WHERE id=?;`, [ guildId ]);
    Cache.del([ Cache.getGuildKey(guildId) ]);
  },
};

module.exports = GuildAccessor;
