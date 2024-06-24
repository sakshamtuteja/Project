const Room = require("../../../repository/Room");
const RoomState = require("../../../repository/RoomState");
const User = require("../../../repository/User");
const { generateRandomPlayersSequence } = require("../../../utils/game");
const bot = require("../../bot");

const roomVoteCallback = async (query) => {
  const chatId = query.from.id;
  const roomId = query.data.split("_")[2];
  const name = query.from.first_name;
  const voteFor = query.data.split("_")[3];
  const round = Number(query.data.split("_")[4]);

  const room = await Room.findById(roomId);

  if (!room) {
    return bot.sendMessage(chatId, `Room *${roomId}* does not exist`, {
      parse_mode: "Markdown",
    });
  }

  const currentRoomState = await RoomState.findById(roomId);
  if (!currentRoomState) {
    return bot.sendMessage(
      chatId,
      `Room *${roomId}* does not exist or not playing at the moment`,
      {
        parse_mode: "Markdown",
      }
    );
  }

  if (currentRoomState.round !== round) {
    return;
  }

  const votes = currentRoomState.votes;
  const vote = votes.find((vote) => vote.chatId == chatId);
  const voteForPlayer = await User.findByChatId(voteFor);

  if (vote) {
    return bot.sendMessage(chatId, `You already voted`);
  }

  votes.push({
    chatId,
    voteFor,
  });

  await RoomState.update({
    id: roomId,
    votes,
  });

  let text = `
*${name}* voted for *${voteForPlayer.name}*
`;
  await Promise.all(
    currentRoomState.players.map(async (playerChatId) => {
      await bot.sendMessage(playerChatId, text, {
        parse_mode: "Markdown",
      });
    })
  );

  const votesCount = votes.length;
  const playersCount = currentRoomState.players.length;

  let allPlayers;

  if (votesCount === playersCount) {
    allPlayers = await Promise.all(
      room.players.map(async (playerChatId) => {
        const player = await User.findByChatId(playerChatId);
        return player;
      })
    );

    const votesFor = votes.reduce((acc, vote) => {
      acc[vote.voteFor] = (acc[vote.voteFor] || 0) + 1;
      return acc;
    }, {});

    const maxVoteFor = Object.keys(votesFor).reduce((a, b) =>
      votesFor[a] > votesFor[b] ? a : b
    );

    const maxVoteForCount = votesFor[maxVoteFor];

    if (maxVoteForCount === 1) {
      const text = `
No one is eliminated! Handle it yourselves!
`;
      return await Promise.all(
        currentRoomState.players.map(async (playerChatId) => {
          await bot.sendMessage(playerChatId, text, {
            parse_mode: "Markdown",
          });
        })
      );
    } else {
      let role = "Civilian";
      if (maxVoteFor == currentRoomState.undercoverId) {
        role = "Undercover";
      } else if (maxVoteFor == currentRoomState.mrWhiteId) {
        role = "Mr White";
      }
      const maxVoteForName = allPlayers.find(
        (player) => player.chatId == maxVoteFor
      ).name;

      let text = "";

      if (role === "Mr White") {
        text = `
*${maxVoteForName}* is *${role}*. Waiting for Mr White to guess the word...
`;
      } else {
        text = `
*${maxVoteForName}* is *${role}* and eliminated!
`;
      }

      await Promise.all(
        currentRoomState.players.map(async (playerChatId) => {
          await bot.sendMessage(playerChatId, text, {
            parse_mode: "Markdown",
          });
        })
      );

      if (role === "Mr White") {
        currentRoomState.status = RoomState.WAITING_FOR_MR_WHITE;
        await RoomState.update(currentRoomState);
        const text = "Guess the word! Mr White...";
        return bot.sendMessage(maxVoteFor, text, {
          parse_mode: "Markdown",
        });
      }

      currentRoomState.status = RoomState.PLAYING;
      currentRoomState.round += 1;
      currentRoomState.votes = [];
      currentRoomState.players = currentRoomState.players.filter(
        (player) => player != maxVoteFor
      );
      currentRoomState.sequence = generateRandomPlayersSequence(
        currentRoomState.players,
        currentRoomState.mrWhiteId,
        currentRoomState.undercoverId
      );
      console.log(currentRoomState);

      await RoomState.update(currentRoomState);
    }

    const isGameOver = await handleWin(currentRoomState);
    if (isGameOver) {
      return;
    }

    text = `Round ${currentRoomState.round}!

Players Sequence:
${currentRoomState.sequence
  .map((player, index) => {
    return `${index + 1}. ${allPlayers.find((p) => p.chatId == player).name}`;
  })
  .join("\n")}

Vote for elimination:
      `;

    const inline_keyboard = currentRoomState.players.map((player, index) => {
      return [
        {
          text: `${index + 1}. ${
            allPlayers.find((p) => p.chatId == player).name
          }`,
          callback_data: `room_vote_${roomId}_${player}_${currentRoomState.round}`,
        },
      ];
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

module.exports = roomVoteCallback;
