const Room = require("../../../repository/Room");
const User = require("../../../repository/User");
const bot = require("../../bot");

const roomJoinHandler = async (message, ...args) => {
  const chatId = message.chat.id;

  const roomId = args[0];
  let room = await Room.findById(roomId);
  if (!room) {
    return bot.sendMessage(
      chatId,
      `Room *${roomId}* does not exist

Example: /join 123456
    `,
      {
        parse_mode: "Markdown",
      }
    );
  }

  const name = message.from.first_name;
  if (room.players.includes(chatId)) {
    return bot.sendMessage(chatId, `You are already in the room`);
  }

  room = await Room.update({
    id: roomId,
    players: [...new Set([...room.players, chatId])],
  });

  const players = await Promise.all(
    room.players.map(async (playerChatId) => {
      const player = await User.findByChatId(playerChatId);
      return player.name;
    })
  );

  const text = `
*${name}* joined room *${roomId}*!

Players:
   ${players.map((player, index) => `${player}`).join(", ")}
`;
  room.players.forEach((playerChatId) => {
    bot.sendMessage(playerChatId, text, {
      parse_mode: "Markdown",
    });
  });
};

module.exports = roomJoinHandler;
