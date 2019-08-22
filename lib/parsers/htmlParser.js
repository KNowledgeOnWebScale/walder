const Parser = require('./parser');
const Path = require('path');
const HTMLInfo = require('../models/htmlInfo');

/**
 * Parses the HTML template information and returns it as a {statusCode: HTMLInfo} object.
 *
 * @type {module.GraphQLLDParser}
 */
module.exports = class HtmlParser extends Parser {
  constructor() {
    super();
  }

  static parse(data, basePath) {
    const result = {};

    // Extract the file
    for (let statusCode in data) {
      let file = data[statusCode];
      if (!Path.isAbsolute(file)) {
        file = Path.resolve(basePath, file);
      }

      // Extract the engine
      let engine = Path.extname(file).slice(1);

      // Use handlebars for html files
      if (engine === 'html') {
        engine = 'handlebars';
      }

      result[statusCode] = new HTMLInfo(engine, file);
    }

    return result;
  }
};