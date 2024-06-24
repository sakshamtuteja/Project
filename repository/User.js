/**
 * @typedef {Object} IUser
 * @property {string} chatId
 * @property {string} name
 * @property {Number} score
 */

/**
 * @type {Record<string, IUser>}
 */
const users = {};

/**
 * Encapsulates all database actions for users.
 * @class
 */
class User {
  /**
   * Creates a new user.
   * @param {Object} user
   * @returns {Promise<IUser>}
   */
  static async create(user) {
    users[user.chatId] = user;
    console.log(users);
    return user;
  }

  /**
   * Finds a user by chatId.
   * @param {string} chatId
   * @returns {Promise<IUser>}
   */
  static async findByChatId(chatId) {
    return users[chatId] || null;
  }

  /**
   * Updates a user.
   * @param {User} user
   * @returns {Promise<IUser>}
   */
  static async update(user) {
    users[user.chatId] = {
      ...users[user.chatId],
      ...user,
    };
    return users[user.chatId];
  }

  /**
   * Deletes a user.
   * @param {string} chatId
   * @returns {Promise<boolean>}
   */
  static async delete(chatId) {
    if (!users[chatId]) return false;
    delete users[chatId];
    return true;
  }
}

module.exports = User;
