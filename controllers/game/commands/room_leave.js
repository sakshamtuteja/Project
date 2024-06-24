const Room = require("../../../repository/Room");
const User = require("../../../repository/User");
const bot = require("../../bot");

const roomLeaveHandler = async (message, ...args) => {
  const chatId = message.chat.id;

  const roomId = args[0];
  let room = await Room.findById(roomId);
  if (!room) {
    return bot.sendMessage(
      chatId,
      `Room *${roomId}* does not exist

Example: /leave 123456
    `,
      {
        parse_mode: "Markdown",
      }
    );
  }

  const name = message.from.first_name;
  if (!room.players.includes(chatId)) {
    return bot.sendMessage(chatId, `You are not in the room`);
  }

  room = await Room.update({
    id: roomId,
    players: room.players.filter((player) => player !== chatId),
  });

  const players = await Promise.all(
    room.players.map(async (playerChatId) => {
      const player = await User.findByChatId(playerChatId);
      return player.name;
    })
  );

  const text = `
*${name}* left room *${roomId}*!

Players:
    ${players.map((player, index) => `${player}`).join(", ")}
`;
  await Promise.all(
    room.players.map(async (playerChatId) => {
      return bot.sendMessage(playerChatId, text, {
        parse_mode: "Markdown",
      });
    })
  );
  await bot.sendMessage(chatId, `You left room *${roomId}*!`, {
    parse_mode: "Markdown",
  });
};

module.exports = roomLeaveHandler;
