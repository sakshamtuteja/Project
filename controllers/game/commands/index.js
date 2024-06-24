const helpHandler = require("./help");
const roomJoinHandler = require("./room_join");
const startHandler = require("./start");
const roomsHandler = require("./rooms");
const roomStopHandler = require("./room_stop");
const roomLeaveHandler = require("./room_leave");

module.exports = {
  start: startHandler,
  help: helpHandler,
  join: roomJoinHandler,
  rooms: roomsHandler,
  stop: roomStopHandler,
  leave: roomLeaveHandler,
};
