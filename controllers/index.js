// @ts-check
const User = require("../repository/User");

const { commands, callbacks, handleMessage } = require("./game");
const bot = require("./bot");

const handler = async (req, _, next) => {
  try {
    const { message, callback_query } = req.body;

    const chatId = message?.chat?.id || callback_query?.from?.id;
    const user = await User.findByChatId(chatId);
    const name = message?.from?.first_name || callback_query?.from?.first_name;
    if (!user) {
      await User.create({
        chatId,
        name,
        score: 0,
      });
      await bot.sendMessage(
        chatId,
        `Hello ${name}! You are new here! Welcome to Undercover!`
      );
    }

    if (callback_query) {
      const { data } = callback_query;

      if (data === "room_new") {
        return callbacks.createNewRoom(callback_query);
      } else if (data === "room_join") {
        return callbacks.joinRoom(callback_query);
      } else if (data.startsWith("room_play_")) {
        return callbacks.playRoom(callback_query);
      } else if (data.startsWith("room_vote_")) {
        return callbacks.voteRoom(callback_query);
      }

      return bot.sendMessage(chatId, `Unknown callback query: ${data}`);
    }

    let { text } = message;

    if (text.charAt(0) === "/") {
      text = text.substr(1);
      const [command, ...args] = text.split(" ");

      switch (command) {
        case "start":
          return commands.start(message, args);
        case "help":
          return commands.help(message, args);
        case "join":
          return commands.join(message, args);
        case "rooms":
          return commands.rooms(message, args);
        case "stop":
          return commands.stop(message, args);
        case "leave":
          return commands.leave(message, args);
        default:
          return bot.sendMessage(chatId, "Unknown command");
      }
    } else {
      return handleMessage(message);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handler,
};
