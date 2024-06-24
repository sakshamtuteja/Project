const Room = require("../../../repository/Room");
const bot = require("../../bot");
const { generateUniqueRoomId } = require("../../../utils/room");

const newRoomCallback = async (query) => {
  const chatId = query.from.id;
  const name = query.from.first_name;

  const newRoomId = await generateUniqueRoomId();
  await Room.create({
    id: newRoomId,
    players: [chatId],
  });
  const text = `
Room *${newRoomId}* created!

Players:
  1. ${name}
`;
  return bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
  });
};

module.exports = newRoomCallback;
