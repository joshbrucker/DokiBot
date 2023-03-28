// This file needs a BIG update and cleaning...
const { ignore } = require("@joshbrucker/discordjs-utils");
const contractions = require("expand-contractions");
const fs = require("fs");
const isUrl = require("is-url");
const WordPOS = require("wordpos");
const { MessageEmbed } = require("discord.js");

const { IGNORE_ERRORS } = require(global.__basedir + "/constants/constants.js");

const utils = require(__basedir + "/utils/utils.js");
const db = require(__basedir + "/database/db.js");

const articles = ["a", "an", "the"];

// WORDS
const personalPronouns = ["i", "we", "you", "he", "she", "it", "they"];
const objectPronouns = ["me", "us", "you", "her", "him", "it", "them"];
const possessivePronouns = ["mine", "ours", "yours", "hers", "his", "theirs"];

const possessives = ["my", "our", "your", "his", "her", "its", "their"];

const conjunctions = ["and", "but", "yet"];

const commonPrepositions = ["about", "above", "across", "after", "against", "among",
    "around", "at", "before", "behind", "below", "beside", "between", "by", "down",
    "during", "for", "from", "in", "inside", "into", "near", "of", "off", "on",
    "out", "over", "through", "to", "toward", "under", "up", "with"];
const lessCommonPrepositions = ["aboard", "along", "amid", "as", "beneath", "beyond",
    "but", "concerning", "considering", "despite", "except", "following", "like",
    "minus", "next", "onto", "opposite", "outside", "past", "per", "plus", "regarding",
    "round", "save", "since", "than", "till", "underneath", "unlike", "until", "upon",
    "versus", "via", "within", "without"];
const prepositions = commonPrepositions.concat(lessCommonPrepositions);

let dokipoemUpdate = async function(guildData, message) {
  let currentPoem = guildData.currentPoem;
  let nextWord = await generateNextWord(message);

  if (!nextWord) return;

  let time;
  switch(guildData.poemFrequency) {
    case "second":
      time = 1;
      break;
    case "minute":
      time = 60;
      break;
    case "hour":
      time = 60 * 60;
      break;
    case "day":
      time = 60 * 60 * 24;
      break;
  }

  await guildData.updateNextPoemUpdateTime(new Date(new Date().getTime() + time*1000));

  if (currentPoem == null) {
    currentPoem = nextWord[0].toUpperCase() + nextWord.substr(1);
  } else {
    currentPoem += " " + nextWord;
  }

  let allLines = currentPoem.split("\n\n");
  let lastLine = allLines[allLines.length - 1];
  let wordsInLine = lastLine.split(" ");

  let oddsOfEndingLine = wordsInLine.length * 3;

  if (oddsOfEndingLine > (utils.random(100) + 1)) {
    // end line
    currentPoem += "\n\n";

    let oddsOfEndingPoem = allLines.length * 5;
    if (oddsOfEndingPoem > (utils.random(100) + 1)) {
      let embed = new MessageEmbed()
          .setTitle("Your Poem")
          .setDescription(currentPoem);

      await message.channel.send({ embeds: [ embed ]})
          .catch(ignore(IGNORE_ERRORS.SEND));
      
      currentPoem = null;
      await guildData.updateNextPoemUpdateTime(new Date());
    }
  }

  await guildData.updateCurrentPoem(currentPoem);
};


async function generateNextWord(message) {
  let cleanedInput = cleanInput(message.content);
  if (!cleanedInput) return null;

  let splitInput = cleanedInput.split(" ");

  return getRandomFromList(splitInput);
}

// If you are trying to read the below code... I am sorry.
// This is manual language processing that I decided to put on hold for now (or forever)...

// async function generateNextWord(currentPoem, message) {
//   let wordpos = new WordPOS({ stopwords: false });
//   let cleanedInput = cleanInput(message.content);

//   if (!cleanedInput) return;

//   let pos = processPOSWithCustomFields(await wordpos.getPOS(cleanedInput));

//   // Get any word
//   if (!currentPoem || currentPoem.endsWith("\n\n")) {
//     let splitInput = cleanedInput.split(" ");
//     return getRandomFromList(splitInput);
//   }

//   let lastLine = currentPoem.split("\n\n").pop();
//   let lineWords = lastLine.split(" ");
//   let lastWord = lineWords.pop().toLowerCase();

//   let nextWord;
//   if (lastWord === "a") {
//     let consonantNouns = pos.nouns.filter(value => !utils.startsWithVowel(value));
//     let consonantAdjectives = pos.adjectives.filter(value => !utils.startsWithVowel(value));
//     let consonantAdverbs = pos.adjectives.filter(value => !utils.startsWithVowel(value));

//     let deciderVal = utils.random(100);

//     let randomNoun = getRandomFromList(consonantNouns);
//     let randomAdjective = getRandomFromList(consonantAdjectives);
//     let randomAdverb = getRandomFromList(consonantAdverbs);

//     nextWord = randomNoun;
//     if (deciderVal >= 60 && randomAdjective) {
//       nextWord = randomAdjective;
//     }
//     if (deciderVal >= 90 && randomAdverb) {
//       nextWord = randomAdverb;
//     }

//   } else if (lastWord === "an") {
//     let vowelNouns = pos.nouns.filter(value => utils.startsWithVowel(value));
//     let vowelAdjectives = pos.adjectives.filter(value => utils.startsWithVowel(value));
//     let vowelAdverbs = pos.adjectives.filter(value => utils.startsWithVowel(value));

//     let deciderVal = utils.random(100);

//     let randomNoun = getRandomFromList(vowelNouns);
//     let randomAdjective = getRandomFromList(vowelAdjectives);
//     let randomAdverb = getRandomFromList(vowelAdverbs);

//     nextWord = randomNoun;
//     if (deciderVal >= 60 && randomAdjective) {
//       nextWord = randomAdjective;
//     }
//     if (deciderVal >= 90 && randomAdverb) {
//       nextWord = randomAdverb;
//     }

//   } else if (lastWord === "the") {
//     let deciderVal = utils.random(100);

//     let randomNoun = getRandomFromList(pos.nouns);
//     let randomAdjective = getRandomFromList(pos.adjectives);
//     let randomAdverb = getRandomFromList(pos.adverbs);

//     nextWord = randomNoun;
//     if (deciderVal >= 60 && randomAdjective) {
//       nextWord = randomAdjective;
//     }
//     if (deciderVal >= 90 && randomAdverb) {
//       nextWord = randomAdverb;
//     }

//   } else if (conjunctions.includes(lastWord)) {
//     nextWord = getRandomFromList(pos.nouns
//         .concat(pos.adverbs)
//         .concat(pos.articles)
//         .concat(pos.possessivePronouns)
//         .concat(pos.possessives)
//         .concat(pos.conjunctions)
//         .concat(pos.prepositions)
//         .concat(pos.articles)
//     );

//   } else if (await wordpos.isAdjective(lastWord)) {
//     nextWord = getRandomFromList(pos.nouns);

//   } else if (await wordpos.isAdverb(lastWord)) {
//     if (lineWords.length > 0) {
//       let secondLastWord = lineWords.pop().toLowerCase();
//       if (articles.includes(secondLastWord) || possessives.includes(secondLastWord)) {
//         nextWord = getRandomFromList(pos.adjectives);
//       } else if (await wordpos.isVerb(secondLastWord)) {
//         nextWord = getRandomFromList(pos.prepositions);
//       } else {
//         nextWord = getRandomFromList(pos.verbs);
//       }
//     }

//   } else if (await wordpos.isVerb(lastWord)) {
//     nextWord = getRandomFromList(pos.adverbs
//         .concat(pos.nouns)
//         .concat(pos.objectPronouns)
//         .concat(pos.personalPronouns)
//         .concat(pos.verbs)
//         .concat(pos.prepositions)
//         .concat(pos.articles)
//     );

//   } else if (objectPronouns.includes(lastWord) || possessivePronouns.includes(lastWord)) {
//     nextWord = getRandomFromList(pos.adverbs
//         .concat(pos.conjunctions)
//     );

//   } else if (possessives.includes(lastWord)) {
//     nextWord = getRandomFromList(pos.nouns
//         .concat(pos.adverbs)
//         .concat(pos.adjectives)
//         .concat(pos.personalPronouns)
//     );

//   } else if (prepositions.includes(lastWord)) {
//     nextWord = getRandomFromList(pos.nouns
//         .concat(pos.objectPronouns)
//         .concat(pos.articles)
//         .concat(pos.conjunctions)
//         .concat(pos.possessives)
//         .concat(pos.objectPronouns)
//         .concat(pos.adverbs)
//     );

//   // Nouns, personal pronouns, and "other" words
//   } else {
//     let deciderVal = utils.random(100);

//     let randomVerb = getRandomFromList(pos.verbs);
//     let randomAdverb = getRandomFromList(pos.adverbs);
//     let randomConjunction = getRandomFromList(pos.conjunctions);

//     nextWord = randomVerb;
//     if (deciderVal >= 85 && randomAdverb) {
//       nextWord = randomAdverb;
//     }
//     if (deciderVal >= 95 && randomConjunction) {
//       nextWord = randomConjunction;
//     }
//   }

//   return nextWord;
// }

// function processPOSWithCustomFields(pos) {
//   pos.articles = pos.rest.filter(value => articles.includes(value));
//   pos.personalPronouns = pos.rest.filter(value => personalPronouns.includes(value));
//   pos.objectPronouns = pos.rest.filter(value => objectPronouns.includes(value));
//   pos.possessivePronouns = pos.rest.filter(value => possessivePronouns.includes(value));
//   pos.possessives = pos.rest.filter(value => possessives.includes(value));
//   pos.conjunctions = pos.rest.filter(value => conjunctions.includes(value)); 
//   pos.prepositions = pos.rest.filter(value => prepositions.includes(value));

//   pos.rest = pos.rest.filter(value => !articles.includes(value) && !personalPronouns.includes(value) &&
//       !objectPronouns.includes(value) && !possessivePronouns.includes(value) && !conjunctions.includes(value) &&
//       !prepositions.includes(value));

//   pos.nouns = pos.nouns.concat(pos.rest);

//   return pos;
// }

function getRandomFromList(list) {
  if (list.length > 0) {
      return list[Math.floor(Math.random() * list.length)];
  }
  return null;
}

function cleanInput(input) {
  const COMMON_PREFIXES = /^(-|--|=|==|\$|.?\!|%|&|\^|>|<|\*|~|`|.?\?|\+|\+\+).*/;
  const EMOJI_MATCH = /<:.*>/g;
  const NOTIFY_MATCH = /<@!.*:>/g;
  const PUNCTUATION_MATCH = /(!|@|#|\$|%|\^|&|\*|\(|\)|-|_|=|\+|\[|{|\]|}|\.|,|>|<|\?|\/|`|~)/g;

  if (input.match(COMMON_PREFIXES)) return null;

  // let cleanedInput = contractions.expand(input.toLowerCase().split(" ").filter(value => !isUrl(value) && value.length < 30).join(" "));

  return input.toLowerCase().split(" ")
      .filter(value => !isUrl(value) && value.length < 30).join(" ")
      .replace(EMOJI_MATCH, "").replace(NOTIFY_MATCH, "").replace(PUNCTUATION_MATCH, "");
}

module.exports = dokipoemUpdate;
