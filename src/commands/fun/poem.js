const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const { ignore } = require("@joshbrucker/discordjs-utils");

const utils = require(global.__basedir + "/utils/utils");
const dokiWords = require(global.__basedir + "/resources/doki_words.json");
const { IGNORE_ERRORS } = require(global.__basedir + "/constants/constants.js");

const WORD_COUNT = 10; // Discord ActionRows/Buttons restricts WORD_COUNT to 25 (5 rows w/ 5 buttons)
const SELECT_COUNT = 3;
const TIMEOUT = 60000;

module.exports = {
  data: new SlashCommandBuilder()
      .setName("poem")
      .setDescription("Create your own poem!"),

  async execute(interaction) {
    let randomWords = {};
    let dokiWordsCopy = JSON.parse(JSON.stringify(dokiWords));

    // choose random words to display to user as buttons
    while (Object.keys(randomWords).length < WORD_COUNT) {
      let keys = Object.keys(dokiWordsCopy);
      let randomKey = keys[utils.random(keys.length)];
      randomWords[randomKey] = dokiWordsCopy[randomKey];
      delete dokiWordsCopy[randomKey];
    }

    // generate action rows
    let actionRows = [];
    for (let i = 0; i < Object.keys(randomWords).length; i++) {
      let actionRow = new ActionRowBuilder();

      let buttons = [];
      for (let j = 0; j < 5 && i < Object.keys(randomWords).length; j++, i++) {
        let key = Object.keys(randomWords)[i];
        buttons.push(new ButtonBuilder()
            .setLabel(key)
            .setStyle("Secondary")
            .setCustomId(key.toLowerCase()));
      }

      actionRow.addComponents(...buttons);
      actionRows.push(actionRow);

      // counter correction
      i--;
    }

    let reply = await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription("Select 3 tags to generate a poem!")
      ],
      components: [ ...actionRows ],
      withResponse: true
    });

    const collector = reply.createMessageComponentCollector({
      time: TIMEOUT
    });

    let selected = new Set();
    collector.on("collect", async interaction => {
      collector.resetTimer();

      let customId = interaction.customId;
      let isActive = customId.endsWith("_active");

      for (let i = 0; i < actionRows.length; i++) {
        for (let j = 0; j < actionRows[i].components.length; j++) {
          let currentButton = actionRows[i].components[j];
          if (customId.startsWith(currentButton.label.toLowerCase())) {
            isActive ? (selected.delete(customId.substr(0, customId.indexOf("_")))) : (selected.add(customId));
            currentButton.setStyle(isActive ? "Secondary" : "Primary");
            currentButton.setCustomId(isActive ? customId.substr(0, customId.indexOf("_")) : customId + "_active");
            break;
          }
        }
      }

      if (selected.size !== SELECT_COUNT) {
        await interaction.update({
          components: [ ...actionRows ]
        }).catch(ignore(IGNORE_ERRORS.UPDATE));
      } else {
        for (let i = 0; i < actionRows.length; i++) {
          for (let j = 0; j < actionRows[i].components.length; j++) {
            actionRows[i].components[j].disabled = true;
          }
        }

        await interaction.update({
          embeds: [
            new EmbedBuilder().setDescription("Generating a poem...")
          ],
          components: [ ...actionRows ]
        }).catch(ignore(IGNORE_ERRORS.UPDATE));

        collector.stop("all_options_selected");
      }
    });
  }
};
