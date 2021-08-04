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
    try {
      const content = frontMatter(fs.readFileSync(htmlInfo.file, 'utf8')); // For some reason the async version take a super long time.
      this.cache[htmlInfo.file] = content;
      if(content.attributes.layout){
        //if this template has a layout, also cache that layout
        const layoutInfo = HTMLInfo.getLayoutInfo(htmlInfo, content.attributes.layout);
        this.load(layoutInfo);
      }
    } catch
      (err) {
      const error = new Error(`Reading the file "${htmlInfo.file}" failed.`);
      error.type = 'IO_READING_FAILED';
      throw error;
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


