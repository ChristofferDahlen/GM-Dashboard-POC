/**
 * @typedef {Object} Character
 * @property {number} id
 * @property {string} name
 * @property {string} player
 * @property {number} initiative
 * @property {number} hp
 * @property {number} hpMax
 * @property {number} ac
 * @property {string[]} conditions
 */

export const MessageType = /** @type {const} */ ({
  FULL_SYNC: 'full_sync',
  UPDATE:    'update',
  REMOVE:    'remove',
})

/**
 * Message factory functions — use these to construct all peer messages.
 */
export const msg = {
  /** @param {Character[]} characters */
  fullSync: (characters) => ({ type: MessageType.FULL_SYNC, characters }),

  /** @param {Character} character */
  update: (character) => ({ type: MessageType.UPDATE, character }),

  /** @param {number} id */
  remove: (id) => ({ type: MessageType.REMOVE, id }),
}

export const CONDITIONS = [
  'Blinded', 'Confused', 'Dazzled', 'Deafened', 'Dying',
  'Fatigued', 'Frightened', 'Paralyzed', 'Prone', 'Sickened', 'Stunned',
]
