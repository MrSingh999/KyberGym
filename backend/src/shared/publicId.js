import { customAlphabet } from 'nanoid';
import { ENTITY_PREFIXES } from './idPrefixes.js';

// Custom alphabet excluding confusing characters: 0, O, 1, I, and lowercase l
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SUFFIX_LENGTH = 8;

const nanoid = customAlphabet(ALPHABET, SUFFIX_LENGTH);

/**
 * Generates a public identifier for an entity with a specified prefix and random suffix.
 * Suffix characters exclude confusing characters (0, O, 1, I, l).
 *
 * @param {string} prefix - The entity prefix (e.g. 'GYM', 'MEM', 'PLAN', etc.)
 * @returns {string} The public ID string (e.g., 'GYM-8XQ7K2PA')
 * @throws {TypeError} If the prefix is not a non-empty string or not supported.
 */
export function generatePublicId(prefix) {
  if (typeof prefix !== 'string' || !prefix) {
    throw new TypeError('Prefix must be a non-empty string');
  }

  const uppercasePrefix = prefix.toUpperCase();
  if (!Object.values(ENTITY_PREFIXES).includes(uppercasePrefix)) {
    throw new TypeError(`Unsupported public ID prefix: ${prefix}`);
  }

  return `${uppercasePrefix}-${nanoid()}`;
}
export { ALPHABET, SUFFIX_LENGTH };
