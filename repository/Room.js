/**
 * Room Schema
 * @typedef {Object} IRoom
 * @property {string} id - Unique id for the room
 * @property {Array<string>} players - Array of chatIds of players in the room
 */

/**
 * @type {Record<string, IRoom>}
 * @private
 */
const rooms = {};

/**
 * Encapsulates all database actions for rooms.
 * @class
 */
class Room {
  /**
   * Creates a new room.
   * @param {IRoom} room
   * @returns {Promise<IRoom>}
   */
  static async create(room) {
    rooms[room.id] = room;
    return room;
  }

  /**
   * Finds a room by id.
   * @param {string} id
   * @returns {Promise<IRoom>}
   */
  static async findById(id) {
    return rooms[id] || null;
  }

  /**
   * Find rooms by chatId.
   * @param {string} chatId
   * @returns {Promise<IRoom>}
   */
  static async findByChatId(chatId) {
    return Object.values(rooms).filter((room) => room.players.includes(chatId));
  }

  /**
   * Updates a room.
   * @param {Object} room
   * @returns {Promise<IRoom>}
   */
  static async update(room) {
    rooms[room.id] = {
      ...rooms[room.id],
      ...room,
    };
    return rooms[room.id];
  }

  /**
   * Deletes a room.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    if (!rooms[id]) return false;
    delete rooms[id];
    return true;
  }

  /**
   * Counts the number of rooms.
   * @returns {Promise<number>}
   */
  static async count() {
    return Object.keys(rooms).length;
  }
}

module.exports = Room;
