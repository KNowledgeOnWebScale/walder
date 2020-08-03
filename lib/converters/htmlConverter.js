'use strict';

const Converter = require('./converter');
const cons = require('consolidate');
const fs = require('fs-extra');
const MarkdownIt = require('markdown-it');
const frontMatter = require('front-matter');
const tmp = require('tmp');
const path = require('path');
const {getEngineFromFilePath} = require('../utils');
const HTMLInfo = require('../models/htmlInfo');
const pug = require('pug');

const markdownOptions = {
  html: true,
  typographer: true,
};

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
    let fileContent;

    try {
      fileContent = await fs.readFile(htmlInfo.file, 'utf8');
    } catch (err) {
      const error = new Error(`Reading the file "${htmlInfo.file}" failed.`);
      error.type = 'IO_READINGFAILED';

      throw error;
    }

    const content = frontMatter(fileContent);
    data = {...data, ...content.attributes};

    if (content.attributes.layout) {
      const layoutPath = path.join(htmlInfo.layoutsDir, content.attributes.layout);
      const layoutEngine = getEngineFromFilePath(layoutPath);
      const layoutDataContent = await HtmlConverter._convertToHTML(htmlInfo.engine, content.body, htmlInfo.file, data);
      HtmlConverter.convert(new HTMLInfo(layoutEngine, layoutPath),{content: layoutDataContent} , callback);
    } else {
      callback(await HtmlConverter._convertToHTML(htmlInfo.engine, content.body, htmlInfo.file, data));
    }
  }

  static async _convertToHTML(engine, fileContent, filePath, data) {
    return new Promise((resolve, reject) => {
      if (engine === 'html') {
        resolve(fileContent);
      } else if (engine === 'md') {
        const md = new MarkdownIt(markdownOptions);
        resolve(md.render(fileContent));
      } else {
        if (engine === 'pug') {
          const pugFn = pug.compile(fileContent, {
            filename: filePath
          });
          const html = pugFn(data);

          resolve(html);
        } else {
          tmp.file(async (err, tmpPath, fd, cleanupCallback) => {
            if (err) {
              reject(err);
            }

            await fs.writeFile(tmpPath, fileContent, 'utf8');
            const html = await cons[engine](tmpPath, data);

            cleanupCallback();
            resolve(html);
          });
        }
      }
    });
  }
};
