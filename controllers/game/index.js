const commands = require("./commands");
const callbacks = require("./callbacks");
const messages = require("./messages");

module.exports = {
  commands,
  callbacks,
  handleMessage: messages,
};
