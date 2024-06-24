const Room = require("../../../repository/Room");
const User = require("../../../repository/User");
const RoomState = require("../../../repository/RoomState");
const bot = require("../../bot");

const roomStopHandler = async (message, ...args) => {
  const chatId = message.chat.id;

  const roomId = args[0];
  let room = await Room.findById(roomId);
  if (!room) {
    return bot.sendMessage(
      chatId,
      `Room *${roomId}* does not exist
    
Example: /stop 123456
    `,
      {
        parse_mode: "Markdown",
      }
    );
  }

  if (!room.players.includes(chatId)) {
    return bot.sendMessage(chatId, `You are not in the room`);
  }

  const currentRoomState = await RoomState.findById(roomId);
  if (!currentRoomState || currentRoomState.state == RoomState.IDLE) {
    return bot.sendMessage(chatId, `Room *${roomId}* is already not running`);
  }

  await RoomState.delete(roomId);
  const text = `Room *${roomId}* stopped!`;
  await Promise.all(
    room.players.map(async (playerChatId) => {
      return bot.sendMessage(playerChatId, text, {
        parse_mode: "Markdown",
      });
    })
  );
};

module.exports = roomStopHandler;
