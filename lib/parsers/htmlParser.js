const Parser = require('./parser');
const Path = require('path');
const HTMLInfo = require('../models/htmlInfo');

/**
 * Parses the HTML template information and returns it as a HTMLInfo object.
 *
 * @type {module.GraphQLLDParser}
 */
module.exports = class HtmlParser extends Parser {
  constructor(data) {
    super(data);
  }

  parse(path, method, basePath) {
    // Extract the file
    let file = this.data.paths[path][method].html;
    if (!Path.isAbsolute(file)) {
      file = Path.resolve(basePath, file);
    }

    // Extract the engine
    let engine = Path.extname(file).slice(1);

    // Use handlebars for html files
    if (engine === 'html') {
      engine = 'handlebars';
    }

    return new HTMLInfo(engine, file);
  }
};