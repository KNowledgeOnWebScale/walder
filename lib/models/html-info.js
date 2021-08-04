'use strict';
const path = require('path');
const {getEngineFromFilePath} = require('../utils');
/**
 * Contains the information required to render a HTML template.
 *
 * @type {module.HTMLInfo}
 */
module.exports = class HTMLInfo {
  constructor(engine, file, description, layoutsDir) {
    this.engine = engine;
    this.file = file;
    this.description = description;
    this.layoutsDir = layoutsDir;
  }

  /**
   * Creates a new htmlInfo object for a given layout file that extends a given template.
   *
   * @param htmlInfo - The HTMLInfo object for the template
   * @param layout - The layout file
   */
  static getLayoutInfo(htmlInfo, layout) {
    const layoutPath = path.join(htmlInfo.layoutsDir, layout);
    const layoutEngine = getEngineFromFilePath(layoutPath);
    return new HTMLInfo(layoutEngine, layoutPath, htmlInfo.description, htmlInfo.layoutsDir)
  }
};
