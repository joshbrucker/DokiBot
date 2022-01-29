const { booruSearchTypes, DanbooruImageCommand } = require("./DanbooruImageCommand");

module.exports = new DanbooruImageCommand(booruSearchTypes.WAIFU).getCommand();
