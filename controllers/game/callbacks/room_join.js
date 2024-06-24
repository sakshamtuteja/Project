const bot = require("../../bot");

const joinRoomCallback = async (query) => {
  const chatId = query.message.chat.id;

  return bot.sendMessage(
    chatId,
    `Please enter the room id to join

Example: /join 123456
`
  );
};

module.exports = joinRoomCallback;
