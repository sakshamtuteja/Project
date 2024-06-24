const Room = require("../../../repository/Room");
const User = require("../../../repository/User");
const bot = require("../../bot");

const startHandler = async (message, ...args) => {
  const chatId = message.chat.id;
  const name = message.from.first_name;

  const userRooms = await Room.findByChatId(chatId);
  let text = `Hello ${name}!`;
  let inline_keyboard = [];
  if (userRooms.length > 0) {
    text += "\n\nYou are in the following rooms:";
    for (let i = 0; i < userRooms.length; i++) {
      const room = userRooms[i];
      text += `\n\n${i + 1}. *${room.id}*`;
      const players = await Promise.all(
        room.players.map(async (playerChatId) => {
          const player = await User.findByChatId(playerChatId);
          return player.name;
        })
      );
      text += `\n  Players: ${players.join(", ")}`;
    }
    text += "\n\nChoose a room to play:";
    userRooms.forEach((room) => {
      inline_keyboard.push([
        {
          text: `${room.id}`,
          callback_data: `room_play_${room.id}`,
        },
      ]);
    });
    inline_keyboard.push([
      {
        text: "Create Room",
        callback_data: "room_new",
      },
    ]);
    inline_keyboard.push([
      {
        text: "Join Room",
        callback_data: "room_join",
      },
    ]);
  } else {
    text += "\n\nYou are not in any room";
    inline_keyboard.push([
      {
        text: "Create Room",
        callback_data: "room_new",
      },
    ]);
    inline_keyboard.push([
      {
        text: "Join Room",
        callback_data: "room_join",
      },
    ]);
  }
  const opts = {
    reply_markup: {
      inline_keyboard,
    },
    parse_mode: "Markdown",
  };
  return bot.sendMessage(chatId, text, opts);
};

module.exports = startHandler;
