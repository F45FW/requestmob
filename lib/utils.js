'use strict';

const crypto = require('crypto');

/**
* @name Utils
* @return {undefined}
*/
class Utils {
  /**
   * @name stringHash
   * @summary returns a hash value for a supplied string
   * @see https://github.com/darkskyapp/string-hash
   * @private
   * @param {object} str - string to hash
   * @return {number} hash - hash value
   */
  stringHash(str) {
    let hash = 5381;
    let i = str.length;
    while (i) {
      hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0;
  }

  /**
   * @name safeJSONStringify
   * @summary Safe JSON stringify
   * @param {object} obj - object to stringify
   * @return {string} string - stringified object.
   */
  safeJSONStringify(obj) {
    // replaceErrors below credited to Jonathan Lonowski via Stackoverflow:
    // https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
    let replaceErrors = (key, value) => {
      if (value instanceof Error) {
        let error = {};
        Object.getOwnPropertyNames(value).forEach((key) => {
          error[key] = value[key];
        });
        return error;
      }
      return value;
    };
    return JSON.stringify(obj, replaceErrors);
  }
}

module.exports = Utils;
