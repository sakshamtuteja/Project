const bot = require("../../bot");

const helpHandler = async (message, ...args) => {
  const chatId = message.chat.id;
  const helpText = `
  /start - start the game bot
  /help - get help
  /rooms - display all the rooms you are into
  /join roomId - join a room
  /stop roomId - stop the game in a room
  /leave roomId - leave a room
  `;
  return bot.sendMessage(chatId, helpText);
};

module.exports = helpHandler;
