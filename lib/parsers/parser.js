/**
 * Parser interface.
 *
 * parsers are used to convert the config file information into objects.
 *
 * @type {module.Parser}
 */
module.exports = class Parser {
  constructor(data) {
    this.data = data;
  }

  parse() {
  }
};