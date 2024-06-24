/**
 * @typedef {Object} IPlayer
 * @property {string} chatId
 * @property {string} role
 * @property {Number} score
 * @property {string} roomId
 */

/**
 * @type {Record<string, IPlayer>}
 */
const players = {};

/**
 * Encapsulates all database actions for players.
 * @class
 */
class Player {
  /**
   * Creates a new player.
   * @param {Object} player
   * @returns {Promise<IPlayer>}
   */
  static async create(player) {
    players[player.chatId] = player;
    console.log(players);
    return player;
  }

  /**
   * Finds a player by chatId.
   * @param {string} chatId
   * @returns {Promise<IPlayer>}
   */
  static async findByChatId(chatId) {
    return players[chatId] || null;
  }

  /**
   * Updates a player.
   * @param {Player} player
   * @returns {Promise<IPlayer>}
   */
  static async update(player) {
    players[player.chatId] = {
      ...players[player.chatId],
      ...player,
    };
    return players[player.chatId];
  }

  /**
   * Deletes a player.
   * @param {string} chatId
   * @returns {Promise<boolean>}
   */
  static async delete(chatId) {
    if (!players[chatId]) return false;
    delete players[chatId];
    return true;
  }
}

module.exports = Player;
