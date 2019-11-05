'use strict';

/**
 * Contains the information required to render a HTML template.
 *
 * @type {module.HTMLInfo}
 */
module.exports = class HTMLInfo {
  constructor(engine, file, description) {
    this.engine = engine;
    this.file = file;
    this.description = description;
  }
};