'use strict';

const fs = require('fs-extra');
const Validator = require('./validator');
const util = require('util');

const ERROR_TEMPLATE =
  `Config file validation error for route '%s' - '%s':
        * File(s) for HTML rendering not found: %s.`;

/**
 * Validates the HTML sections of the config file.
 *
 * @type {module.HtmlInfoValidator}
 */
module.exports = class HtmlInfoValidator extends Validator {
  constructor() {
    super();
  }

  /**
   * Validates HTML info.
   *
   * @param input input to be validated.
   * @param input.routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param input.htmlInfoDictionary object containing html info (see walder/lib/models/html-info.js) per response code, see walder/lib/parsers/html-parser.js
   * @returns {string} validation error description (undefined if all's well)
   */
  static validate(input = {}) {
    if (input.routeInfo && input.htmlInfoDictionary) {
      return this.validateFiles(input.routeInfo, input.htmlInfoDictionary);
    }
  }

  /**
   * Checks if all files are available on the file system.
   * @param routeInfo see validate (input.routeInfo)
   * @param htmlInfoDictionary see validate (input.htmlInfoDictionary)
   * @returns {string} validation error description (undefined if all's well)
   */
  static validateFiles(routeInfo, htmlInfoDictionary) {
    let filesNotFound = [];
    for (const responseCode in htmlInfoDictionary) {
      const file = htmlInfoDictionary[responseCode].file;
      if(!fs.pathExistsSync(file)) {
        filesNotFound.push(file);
      }
    }
    if(filesNotFound.length > 0) {
      return util.format(ERROR_TEMPLATE, routeInfo.path, routeInfo.method, filesNotFound.join(' '));
    }
  }
};
