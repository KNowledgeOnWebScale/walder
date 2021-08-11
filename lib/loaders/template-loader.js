'use strict';

const Loader = require('./loader');
const fs = require("fs");
const frontMatter = require('front-matter');
const HTMLInfo = require("../models/html-info");

/**
 * Caches template files.
 *
 * @type {module.TemplateLoader}
 */
module.exports = class TemplateLoader extends Loader {
  constructor() {
    super();
    this.cache = {};
  }

  /**
   * Loads template file into cache.
   *
   * @param htmlInfo - The information about the HTML
   */
  load(htmlInfo) {
    let content;

    // Try to read the file.
    try {
      content = fs.readFileSync(htmlInfo.file, 'utf8');
    } catch (err) {
      const error = new Error(`Reading the file "${htmlInfo.file}" failed.`);
      error.type = 'IO_READING_FAILED';
      // Pass the filename along so the validator can show the correct file if this error was caused by a layout.
      error.fileName = htmlInfo.file;
      throw error;
    }

    let matter;

    // Try to retrieve frontmatter from the file.
    try {
      matter = frontMatter(content); // For some reason the async version take a super long time.
      this.cache[htmlInfo.file] = matter;
    } catch (err) {
      const error = new Error(`Reading frontmatter from the file "${htmlInfo.file}" failed.`);
      error.type = 'FRONTMATTER_FAILED';
      // Pass the filename along so the validator can show the correct file if this error was caused by a layout.
      error.fileName = htmlInfo.file;
      throw error;
    }

    // If this template has a layout, also cache that layout.
    if (matter.attributes.layout) {
      const layoutInfo = HTMLInfo.getLayoutInfo(htmlInfo, matter.attributes.layout);
      this.load(layoutInfo);
    }
  }

  /**
   * Loads a template file from the cache and returns the content.
   *
   * @param htmlInfo - The information about the HTML
   * @returns FrontMatter - FrontMatter of the template
   */
  getTemplateFromCache(htmlInfo) {
    const ret = this.cache[htmlInfo.file];
    if (!ret) {
      const error = new Error(`Reading the file "${htmlInfo.file}" from the cache failed.`);
      error.type = 'IO_READING_FAILED';
      throw error;
    }
    return ret;
  }
}


