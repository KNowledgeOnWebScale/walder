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
   * @param validatorInput input to be validated.
   * @param validatorInput.routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param validatorInput.htmlInfoDictionary object containing html info (see walder/lib/models/html-info.js) per response code, see walder/lib/parsers/html-parser.js
   */
  static validate(validatorInput = {}) {
    if (validatorInput.routeInfo && validatorInput.htmlInfoDictionary) {
      return this.validateFiles(validatorInput.routeInfo, validatorInput.htmlInfoDictionary);
    }
  }

  /**
   * Checks if all files are available on the file system.
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
