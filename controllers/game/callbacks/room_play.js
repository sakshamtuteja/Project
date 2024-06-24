const Room = require("../../../repository/Room");
const bot = require("../../bot");
const RoomState = require("../../../repository/RoomState");
const {
  getWords,
  generateRandomPlayersSequence,
} = require("../../../utils/game");
const User = require("../../../repository/User");

const roomPlayCallback = async (query) => {
  const chatId = query.from.id;
  const name = query.from.first_name;
  const roomId = query.data.split("_")[2];

  const room = await Room.findById(roomId);
  if (!room) {
    return bot.sendMessage(chatId, `Room *${roomId}* does not exist`, {
      parse_mode: "Markdown",
    });
  }

  if (!room.players.includes(chatId)) {
    return bot.sendMessage(chatId, `You are not in the room`);
  }

  if (room.players.length < 3) {
    return bot.sendMessage(
      chatId,
      `Room *${roomId}* must have at least 3 players`,
      {
        parse_mode: "Markdown",
      }
    );
  }

  const currentRoomState = await RoomState.findById(roomId);
  console.log(currentRoomState);
  if (currentRoomState && currentRoomState.status !== RoomState.IDLE) {
    return bot.sendMessage(chatId, `Room *${roomId}* is already playing`, {
      parse_mode: "Markdown",
    });
  }

  const words = await getWords(room.players.length);
  let players = room.players;
  const undercover = players[Math.floor(Math.random() * players.length)];
  players = players.filter((player) => player !== undercover);
  const mrWhite = players[Math.floor(Math.random() * players.length)];
  players = players.filter((player) => player !== mrWhite);

  const sequence = generateRandomPlayersSequence(
    room.players,
    mrWhite,
    undercover
  );

  const state = {
    id: roomId,
    status: RoomState.PLAYING,
    players: room.players,
    sequence,
    votes: [],
    round: 1,
    word: words.main,
    undercoverWord: words.undercover,
    undercoverId: undercover,
    mrWhiteId: mrWhite,
  };

  if (!currentRoomState) {
    await RoomState.create(state);
  } else {
    await RoomState.update(state);
  }

  players = await Promise.all(
    room.players.map(async (player) => {
      return await User.findByChatId(player).then((user) => user);
    })
  );

  const civilians = players.filter(
    (player) => ![undercover, mrWhite].includes(player.chatId)
  );

  const civiliansText = `Your word is *${words.main}*`;
  const undercoverText = `Your word is *${words.undercover}*`;
  const mrWhiteText = `You are *Mr. White*`;

  await Promise.all(
    civilians.map(async (player) => {
      await bot.sendMessage(player.chatId, civiliansText, {
        parse_mode: "Markdown",
      });
    })
  );

  await bot.sendMessage(undercover, undercoverText, {
    parse_mode: "Markdown",
  });

  await bot.sendMessage(mrWhite, mrWhiteText, {
    parse_mode: "Markdown",
  });

  const text = `
Room *${room.id}* playing!

Round: 1

Players Sequence:
${sequence
  .map((player, index) => {
    return `${index + 1}. ${players.find((p) => p.chatId === player).name}`;
  })
  .join("\n")}

Vote for elimination:
`;

  const inline_keyboard = players.map((player, index) => {
    return [
      {
        text: `${index + 1}. ${player.name}`,
        callback_data: `room_vote_${room.id}_${player.chatId}_1`,
      },
    ];
  });

  const opts = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard,
    },
  };

  players.forEach((player) => {
    bot.sendMessage(player.chatId, text, opts);
  });
};

module.exports = roomPlayCallback;
