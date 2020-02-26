'use strict';

const Parser = require('./parser');
const HTMLInfo = require('../models/htmlInfo');
const {getEngineFromFilePath} = require('../utils');
const path = require('path');

/**
 * Parses the HTML template information and returns it as a {statusCode: HTMLInfo} object.
 *
 * @type {module.GraphQLLDParser}
 */
module.exports = class HtmlParser extends Parser {
  constructor() {
    super();
  }

  static parse(data, basePath, layoutsDir) {
    const result = {};

    // Extract the file
    for (let statusCode in data) {
      let file = data[statusCode]['x-walder-input-text/html'];
      if (!path.isAbsolute(file)) {
        file = path.resolve(basePath, file);
      }

      // Extract the engine
      const engine = getEngineFromFilePath(file);

      result[statusCode] = new HTMLInfo(engine, file, data[statusCode].description, layoutsDir);
    }

    return result;
  }
};
