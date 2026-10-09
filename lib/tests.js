/**
 * A sub-module used only for tests.
 * @module @lumjs/typdef/tests
 */

/**
 * Is a number even?
 * @param {number} n
 * @returns {boolean}
 */
export const isEven = (n) => (n % 2 === 0);

/**
 * Given a string, mix up the case using a test
 * to determine if a character should be uppercase or lowercase.
 * @param {string} input - String to remix.
 * @param {MixCaseTest} [test=isEven] Test to use.
 * Default is isEven() function.
 */
export function mixCase(input, test = isEven) {
  let output = '';
  let pos = 0;
  for (let char of input) {
    if (test(pos, char)) {
      output += char.toLowerCase();
    }
    else {
      output += char.toUpperCase();
    }
    pos++;
  }
  return output;
}

/**
 * A test for mixCase() to determine case to use.
 * @callback MixCaseTest
 * @param {number} pos - Offset index of the character.
 * @param {string} char - The actual character.
 * @returns {boolean} Result determines case to be used;
 * true will be made lowercase, false will be made uppercase.
 */
