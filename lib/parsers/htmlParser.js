const Parser = require('./parser');
const Path = require('path');

class HTMLInfo {
  constructor(engine, file) {
    this.engine = engine;
    this.file = file;
  }
}

/**
 * Parses the html sections and converts them into HTMLInfo objects.
 *
 * @type {module.GraphQLLDParser}
 */
module.exports = class HtmlParser extends Parser {
  constructor(data) {
    super(data);
  }

  parse(path, method, basePath) {
    // Extract the file
    const file = Path.resolve(basePath, this.data.paths[path][method].html);

    // Extract the engine
    const engine = Path.extname(file).slice(1);

    return new HTMLInfo(engine, file);
  }
};