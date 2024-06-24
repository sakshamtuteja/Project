const newRoomCallback = require("./room_new");
const joinRoomCallback = require("./room_join");
const playRoomCallback = require("./room_play");
const voteRoomCallback = require("./room_vote");

module.exports = {
  createNewRoom: newRoomCallback,
  joinRoom: joinRoomCallback,
  playRoom: playRoomCallback,
  voteRoom: voteRoomCallback,
};
