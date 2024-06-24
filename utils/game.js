const words = require("../data/words.js");

const getWords = async () => {
  let topic = words[Math.floor(Math.random() * words.length)];
  // choose 2 different random words from the topic
  const word1 = topic[Math.floor(Math.random() * topic.length)];
  topic = topic.filter((word) => word !== word1);
  const word2 = topic[Math.floor(Math.random() * topic.length)];
  return {
    main: word1,
    undercover: word2,
  };
};

/**
 * Generate random sequence of players.
 * Mr. White will not be in the first 2 players.
 * @param {string[]} players
 * @param {string} mrWhite
 * @param {string} undercover
 * @returns {string[]}
 */
const generateRandomPlayersSequence = (players, mrWhite, undercover) => {
  const shuffledPlayers = shuffle(players);
  const mrWhiteIndex = shuffledPlayers.indexOf(mrWhite);
  if (mrWhiteIndex < 2 && mrWhiteIndex !== -1) {
    const temp = shuffledPlayers[2];
    shuffledPlayers[2] = shuffledPlayers[mrWhiteIndex];
    shuffledPlayers[mrWhiteIndex] = temp;
  }
  return shuffledPlayers.filter((player) => player);
};

const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
};

module.exports = {
  getWords,
  generateRandomPlayersSequence,
};
