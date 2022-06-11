function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function dateFormat(date) {
  return (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();
}

function timeFormat(date) {
  return date.getHours() + ":" + ((date.getMinutes() >= 10) ? ":" : ":0") + date.getMinutes();
}

function getMonthName(int) {
  switch(int) {
    case 1:
      return "January";
    case 2:
      return "February";
    case 3:
      return "March";
    case 4:
      return "April";
    case 5:
      return "May";
    case 6:
      return "June";
    case 7:
      return "July";
    case 8:
      return "August";
    case 9:
      return "September";
    case 10:
      return "October";
    case 11:
      return "November";
    case 12:
      return "December";
  }
}

function stripToNums(string) {
  return string.replace(/\D/g,"");
}

function secondsConverter(int) {
  let remaining = int;

  let days = Math.floor(remaining / 86400);
  if (days < 10) {
    days = "0" + days;
  }
  remaining = remaining % 86400;

  let hours = Math.floor(remaining / 3600);
  if (hours < 10) {
    hours = "0" + hours;
  }
  remaining = remaining % 3600;

  let minutes = Math.floor(remaining / 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  remaining = Math.floor(remaining % 60);

  if (remaining < 10) {
    remaining = "0" + remaining;
  }

  return (days + ":" + hours + ":" + minutes + ":" + remaining);
}

function prefixWithAnOrA(word, capitalize=false) {
  let result = (word.startsWith("a") || word.startsWith("e") || word.startsWith("i") ||
      word.startsWith("o") || word.startsWith("u")) ? "an" : "a";

  return (capitalize ? result[0].toUpperCase() : result) + " " + word;
}
  
function startsWithVowel(word) {
  return (word.startsWith("a") || word.startsWith("e") || word.startsWith("i") ||
      word.startsWith("o") || word.startsWith("u"));
}

function maybePluralize(noun, count, suffix="s") {
  return `${noun}${count !== 1 ? suffix : ''}`;
}

function ignoreMarkdown(content) {
  return content
      .replace(/\*/g, "\\*")
      .replace(/\_/g, "\\_")
      .replace(/\|/g, "\\|")
      .replace(/\~/g, "\\~");
}

module.exports = {
  capitalizeFirstLetter,
  dateFormat,
  timeFormat,
  secondsConverter,
  getMonthName,
  stripToNums,
  prefixWithAnOrA,
  maybePluralize,
  ignoreMarkdown,
  startsWithVowel
};