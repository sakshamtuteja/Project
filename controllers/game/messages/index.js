const Room = require("../../../repository/Room");
const RoomState = require("../../../repository/RoomState");
const User = require("../../../repository/User");
const { generateRandomPlayersSequence } = require("../../../utils/game");
const bot = require("../../bot");

const handleMessage = async (message) => {
  const chatId = message.chat.id;
  const name = message.from.first_name;

  try {
    const rooms = await Room.findByChatId(chatId);
    let roomStates = await Promise.all(
      rooms.map(async (room) => {
        return await RoomState.findById(room.id);
      })
    );
    roomStates = roomStates.filter(
      (roomState) => roomState?.status == RoomState.WAITING_FOR_MR_WHITE
    );

    const currentRoomState = roomStates[0];

    if (currentRoomState) {
      let text = "";
      if (currentRoomState.mrWhiteId == chatId) {
        if (currentRoomState.word.toLowerCase() == message.text.toLowerCase()) {
          text = `Mr. White won! The word is *${currentRoomState.word}*`;

          await RoomState.delete(currentRoomState.id);

          const inline_keyboard = [
            [
              {
                text: "Play Again",
                callback_data: "room_play_" + currentRoomState.id,
              },
            ],
          ];

          return await Promise.all(
            currentRoomState.players.map(async (playerChatId) => {
              await bot.sendMessage(playerChatId, text, {
                parse_mode: "Markdown",
                reply_markup: {
                  inline_keyboard,
                },
              });
            })
          );
        } else {
          text = `Mr. White has been eliminated!`;

          await Promise.all(
            currentRoomState.players.map(async (playerChatId) => {
              await bot.sendMessage(playerChatId, text, {
                parse_mode: "Markdown",
              });
            })
          );

          currentRoomState.status = RoomState.PLAYING;
          currentRoomState.round += 1;
          currentRoomState.votes = [];
          currentRoomState.players = currentRoomState.players.filter(
            (player) => player != currentRoomState.mrWhiteId
          );
          currentRoomState.sequence = generateRandomPlayersSequence(
            currentRoomState.players,
            null,
            currentRoomState.undercoverId
          );

          await RoomState.update(currentRoomState);

          const players = await Promise.all(
            currentRoomState.players.map(async (player) => {
              return await User.findByChatId(player);
            })
          );

          const hasEnded = await handleWin(currentRoomState);
          if (hasEnded) {
            return;
          }

          text = `Round ${currentRoomState.round}!

Players Sequence:
${currentRoomState.sequence
  .map((player, index) => {
    return `${index + 1}. ${players.find((p) => p.chatId == player).name}`;
  })
  .join("\n")}
        `;

          const inline_keyboard = [];
          players.forEach((player, index) => {
            inline_keyboard.push([
              {
                text: `${index + 1} ${player.name}`,
                callback_data: `room_vote_${currentRoomState.id}_${player.chatId}_${currentRoomState.round}`,
              },
            ]);
          });

          return await Promise.all(
            currentRoomState.players.map(async (playerChatId) => {
              await bot.sendMessage(playerChatId, text, {
                parse_mode: "Markdown",
                reply_markup: {
                  inline_keyboard,
                },
              });
            })
          );
        }
      } else {
        text = `Waiting for Mr. White to choose a word. Please wait...`;
      }

      return await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
      });
    }
  } catch (error) {
    // do nothing
    console.error(error);
  }

  return bot.sendMessage(chatId, `Dear ${name}, I don't understand you`);
};

const handleWin = async (currentRoomState) => {
  const roomId = currentRoomState.id;
  const room = await Room.findById(currentRoomState.id);
  const allPlayers = await Promise.all(
    room.players.map(async (player) => {
      return await User.findByChatId(player);
    })
  );

  const civilians = currentRoomState.players.filter(
    (player) =>
      ![currentRoomState.undercoverId, currentRoomState.mrWhiteId].includes(
        player
      )
  );
  const isUndercoverRemaining = currentRoomState.players.find(
    (playerId) => playerId == currentRoomState.undercoverId
  );
  const isMrWhiteRemaining = currentRoomState.players.find(
    (playerId) => playerId == currentRoomState.mrWhiteId
  );

  if (!isUndercoverRemaining && !isMrWhiteRemaining) {
    const text = `
*Game Over!*

*Civilians* won! Word is *${currentRoomState.word}*.
            `;

    await RoomState.delete(currentRoomState.id);

    const inline_keyboard = [
      [
        {
          text: "Play Again",
          callback_data: `room_play_${roomId}`,
        },
      ],
    ];

    await Promise.all(
      room.players.map(async (playerChatId) => {
        await bot.sendMessage(playerChatId, text, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard,
          },
        });
      })
    );

    return true;
  } else if (civilians.length <= 1) {
    if (isUndercoverRemaining && isMrWhiteRemaining) {
      const text = `
*Game Over!*

*Mr White* and *Undercover* won! Word is *${currentRoomState.word}*.
              `;

      await RoomState.delete(currentRoomState.id);

      const inline_keyboard = [
        [
          {
            text: "Play Again",
            callback_data: `room_play_${roomId}`,
          },
        ],
      ];

      await Promise.all(
        room.players.map(async (playerChatId) => {
          await bot.sendMessage(playerChatId, text, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard,
            },
          });
        })
      );

      return true;
    } else if (isUndercoverRemaining) {
      const text = `
*Game Over!*

*Undercover* won! Word is *${currentRoomState.word}*.
              `;

      await RoomState.delete(currentRoomState.id);

      const inline_keyboard = [
        [
          {
            text: "Play Again",
            callback_data: `room_play_${roomId}`,
          },
        ],
      ];

      await Promise.all(
        room.players.map(async (playerChatId) => {
          await bot.sendMessage(playerChatId, text, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard,
            },
          });
        })
      );

      return true;
    } else if (isMrWhiteRemaining) {
      const text = `
*Game Over!*

*Mr White* won! Word is *${currentRoomState.word}*.
      `;

      await RoomState.delete(currentRoomState.id);

      const inline_keyboard = [
        [
          {
            text: "Play Again",
            callback_data: `room_play_${roomId}`,
          },
        ],
      ];

      await Promise.all(
        room.players.map(async (playerChatId) => {
          await bot.sendMessage(playerChatId, text, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard,
            },
          });
        })
      );

      return true;
    }
  }

  return false;
};

module.exports = handleMessage;
