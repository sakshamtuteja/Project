const LETTERS =
  "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const Room = require("../repository/Room");

/**
 * Generate room id of length 6 with letters and numbers.
 * Sequentially generate room id until it is unique.
 * @returns {Promise<string>}
 * @example
 * 1. generateUniqueRoomId() // "aaaaaa"
 * 2. generateUniqueRoomId() // "aaaaab"
 * 27. generateUniqueRoomId() // "aaaaba"
 * 52. generateUniqueRoomId() // "aaaaca"
 */
const generateUniqueRoomId = async () => {
  const roomIdNumber = await Room.count();
  let roomId = "";
  let remainder = roomIdNumber;
  while (roomId.length < 6) {
    roomId = LETTERS[remainder % LETTERS.length] + roomId;
    remainder = Math.floor(remainder / LETTERS.length);
  }
  return roomId;
};

module.exports = {
  generateUniqueRoomId,
};
