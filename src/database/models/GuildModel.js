const { runQuery } = require("../db.js");
const Cache = require(__basedir + "/cache/Cache.js");

class GuildModel {
  constructor(id, currentPoem, poemChannel, nextPoemUpdateTime, poemFrequency, allowInsults, nextInsultTime) {
    this.id = id;
    this.currentPoem = currentPoem;
    this.poemChannel = poemChannel;
    this.nextPoemUpdateTime = nextPoemUpdateTime;
    this.poemFrequency = poemFrequency;
    this.allowInsults = allowInsults;
    this.nextInsultTime = nextInsultTime;

    this.cacheKey = Cache.getGuildKey(this.id);
  }

  async updateCurrentPoem(poem) {
    this.currentPoem = poem;
    await runQuery(`UPDATE guild SET current_poem=? WHERE id=?;`, [ poem, this.id ]);
    Cache.del([this.cacheKey]);
  }

  async updatePoemChannel(channelId) {
    this.poemChannel = channelId;
    await runQuery(`UPDATE guild SET poem_channel=? WHERE id=?;`, [ channelId, this.id ]);
    Cache.del([this.cacheKey]);
  }

  async updateNextPoemUpdateTime(date) {
    this.nextPoemUpdateTime = date;
    await runQuery(`UPDATE guild SET next_poem_update_time=? WHERE id=?;`, [ date, this.id ]);
    Cache.del([this.cacheKey]);
  }

  async updatePoemFrequency(frequency) {
    this.poemFrequency = frequency;
    await runQuery(`UPDATE guild SET poem_frequency=? WHERE id=?;`, [ frequency, this.id ]);
    Cache.del([this.cacheKey]);
  }

  async updateAllowInsults(allow) {
    this.allowInsults = allow;
    await runQuery(`UPDATE guild SET allow_insults=? WHERE id=?;`, [ allow, this.id ]);
    Cache.del([this.cacheKey]);
  }

  async updateNextInsultTime(date) {
    this.nextInsultTime = date;
    await runQuery(`UPDATE guild SET next_insult_time=? WHERE id=?;`, [ date, this.id ]);
    Cache.del([this.cacheKey]);
  }
}

module.exports = GuildModel;
