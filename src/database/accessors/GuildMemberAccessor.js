const { runQuery } = require("../db.js");
const Cache = require(global.__basedir + "/cache/Cache.js");
const GlobalMemberAccessor = require("./GlobalMemberAccessor.js");
const GuildAccessor = require("./GuildAccessor.js");
const GuildMember = require(global.__basedir + "/structures/GuildMember.js");

const GuildMemberAccessor = {
  async get(memberId, guildId) {
    let data = await Cache.get(Cache.getGuildMemberKey(memberId, guildId), async () => {
      let res = await runQuery(`SELECT * FROM guild_member WHERE id=? AND guild_id=?;`, [ memberId, guildId ]);

      // If not found, add and then retrieve again
      if (res === null || res.length === 0) {
        await this.add(memberId, guildId);
        res = await runQuery(`SELECT * FROM guild_member WHERE id=? AND guild_id=?;`, [ memberId, guildId ]);
      }

      return res;
    });

    if (data && data.length > 0) {
      return new GuildMember(data[0].id, data[0].guild_id, data[0].insult_notify, data[0].ignore_me, data[0].disable_slash_warning);
    }

    return null;
  },

  async add(memberId, guildId) {
    // Make sure foreign key entries exist before adding, does nothing if already exist
    await GlobalMemberAccessor.add(memberId);
    await GuildAccessor.add(guildId);

    await runQuery(`INSERT INTO guild_member (id, guild_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id, guild_id=guild_id;`, [ memberId, guildId ]);
  },

  async remove(memberId, guildId) {
    await runQuery(`DELETE FROM guild_member WHERE id=? AND guild_id=?;`, [ memberId, guildId ]);
    Cache.del([ Cache.getGuildMemberKey(memberId, guildId) ]);
  },
};

module.exports = GuildMemberAccessor;
