/**
 * Room state schema
 * @typedef {Object} IRoomState
 * @property {"waiting"|"playing"|"finished"} status
 * @property {Array<string>} players
 * @property {Array<string>} sequence
 * @property {Array<Record<string, string>>} votes
 * @property {Record<string, number>} scores
 * @property {number} round
 * @property {string} word
 * @property {string} undercoverId
 * @property {string} mrWhiteId
 * @property {string} undercoverWord
 */

/**
 * @type {Record<string, IRoomState>}
 * @private
 */
const rooms = {};

/**
 * Encapsulates all database actions for room states.
 * @class
 */
class RoomState {
  static IDLE = "idle";
  static PLAYING = "playing";
  static WAITING_FOR_MR_WHITE = "waiting_for_mr_white";

  /**
   * Creates a new room state.
   * @param {IRoomState} roomState
   * @returns {Promise<IRoomState>}
   */
  static async create(roomState) {
    rooms[roomState.id] = roomState;
    return roomState;
  }

  /**
   * Finds a room state by room id.
   * @param {string} id - Room id
   * @returns {Promise<IRoomState>}
   */
  static async findById(id) {
    return rooms[id] || null;
  }

  /**
   * Updates a room state.
   * @param {Object} roomState
   * @returns {Promise<IRoomState>}
   */
  static async update(roomState) {
    rooms[roomState.id] = {
      ...rooms[roomState.id],
      ...roomState,
    };
    return rooms[roomState.id];
  }

  /**
   * Deletes a room state.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    if (!rooms[id]) return false;
    delete rooms[id];
    return true;
  }
}

module.exports = RoomState;
