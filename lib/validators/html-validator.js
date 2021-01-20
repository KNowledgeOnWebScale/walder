'use strict';

const assert = require('assert').strict;
const fs = require('fs-extra');
const SubValidator = require('./sub-validator');
const util = require('util');

const ERROR_TEMPLATE =
  `Config file validation error for route '%s' - '%s':
        * File(s) for HTML rendering not found: %s.`;

/**
 * Validates the HTML sections of the config file.
 *
 * @type {module.HtmlInfoValidator}
 */
module.exports = class HtmlInfoValidator extends SubValidator {
  constructor(logger) {
    super();

    this.logger = logger;
  }

  /**
   * Validates HTML info.
   *
   * @param input input to be validated.
   * @param input.routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param input.htmlInfoDictionary object containing html info (see walder/lib/models/html-info.js) per response code, see walder/lib/parsers/html-parser.js
   *
   * @returns Promise, whose resolution is: {string} validation error description (undefined if all's well)
   */
  async validate(input = {}) {
    if (input.routeInfo && input.htmlInfoDictionary) {
      return await this.validateFiles(input.routeInfo, input.htmlInfoDictionary);
    }
  }

  /**
   * Checks if all files are available on the file system.
   *
   * @param routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param htmlInfoDictionary object containing html info (see walder/lib/models/html-info.js) per response code, see walder/lib/parsers/html-parser.js
   *
   * @returns Promise, whose resolution is: {string} validation error description (undefined if all's well)
   */
  async validateFiles(routeInfo, htmlInfoDictionary) {
    let filesNotFound = [];
    for (const responseCode in htmlInfoDictionary) {
      const file = htmlInfoDictionary[responseCode].file;
      try {
        assert.ok(await fs.pathExists(file));
      } catch (e) {
        filesNotFound.push(file);
      }
    }
    if(filesNotFound.length > 0) {
      return util.format(ERROR_TEMPLATE, routeInfo.path, routeInfo.method, filesNotFound.join(' '));
    }
  }
};
