/**
 * Contains the information required to render a HTML template.
 *
 * @type {module.HTMLInfo}
 */
module.exports = class HTMLInfo {
  constructor(engine, file) {
    this.engine = engine;
    this.file = file;
  }
};