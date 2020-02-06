'use strict';

const Converter = require('./converter');
const cons = require('consolidate');
const fs = require('fs-extra');
const MarkdownIt = require('markdown-it');

/**
 * Builds the given HTML template and completes it with the given JSON data.
 *
 * @type {module.HtmlConverter}
 */
module.exports = class HtmlConverter extends Converter {
  constructor() {
    super();
  }

  /**
   * This method generates HTML and gives it to a callback.
   * @param htmlInfo The information about HTML (path, engine)
   * @param data The JSON data that is used by the engine to substitute variables.
   * @param callback The method that is called with the generated HTML.
   * @returns {Promise<void>}
   */
  static async convert(htmlInfo, data, callback) {
    if (htmlInfo.engine === 'html') {
      const html = fs.readFileSync(htmlInfo.file);
      callback(html);
    } else if (htmlInfo.engine === 'md') {
      const md = new MarkdownIt();
      const markdownStr = await fs.readFile(htmlInfo.file, 'utf8');
      const html = md.render(markdownStr);
      callback(html);
    } else {
      cons[htmlInfo.engine](htmlInfo.file, data, (error, html) => {
        if (error) {
          throw error;
        }
        callback(html);
      })
    }
  }
};
