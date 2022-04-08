const GuildModel = require(__basedir + "/database/models/GuildModel.js");

class Guild extends GuildModel {
  constructor(id, currentPoem, poemChannel, nextPoemUpdateTime, poemFrequency, allowInsults, nextInsultTime) {
    super(id, currentPoem, poemChannel, nextPoemUpdateTime, poemFrequency, allowInsults, nextInsultTime);
  }
}

module.exports = Guild;
