'use strict';

const Converter = require('./converter');
const cons = require('consolidate');
const fs = require('fs-extra');
const MarkdownIt = require('markdown-it');
const frontMatter = require('front-matter');
const tmp = require('tmp');
const path = require('path');
const {getEngineFromFilePath} = require('../utils');
const HTMLInfo = require('../models/html-info');
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
   * This method generates HTML.
   * @param htmlInfo - The information about HTML (path, engine)
   * @param data - The JSON data that is used by the engine to substitute variables.
   * @returns {Promise<void>}
   */
  static convert(htmlInfo, data) {
    return new Promise(async (resolve, reject) => {
      let fileContent;

      try {
        fileContent = await fs.readFile(htmlInfo.file, 'utf8');
      } catch (err) {
        if (htmlInfo && htmlInfo.file) {
          const error = new Error(`Reading the file "${htmlInfo.file ? htmlInfo.file : "(undefined)"}" failed.`);
          error.type = 'IO_READING_FAILED';
          reject(error);
        } else {
          reject(new Error(`Not given: htmlInfo.file.`));
        }
        return;
      }

      const content = frontMatter(fileContent);
      data = {...data, ...content.attributes};

      try {
        if (content.attributes.layout) {
          try {
            const layoutPath = path.join(htmlInfo.layoutsDir, content.attributes.layout);
            const layoutEngine = getEngineFromFilePath(layoutPath);
            const layoutDataContent = await HtmlConverter._convertToHTML(htmlInfo.engine, content.body, htmlInfo.file, data);
            const html = await HtmlConverter.convert(new HTMLInfo(layoutEngine, layoutPath), {content: layoutDataContent});
            resolve(html);
          } catch (err) {
            reject(err);
          }
        } else {
          resolve(await HtmlConverter._convertToHTML(htmlInfo.engine, content.body, htmlInfo.file, data));
        }
      } catch(err) {
        const error = new Error(`Converting to HTML failed.`);
        error.type = 'HTML_CONVERSION_FAILED';

        reject(error);
      }
    });
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

  /**
   * This is a wrapper around convert(), that will render some default HTML if the expected conversion fails.
   * Useful in error conditions.
   *
   * @param htmlInfo - see convert()
   * @param data - see convert()
   *
   * @param message - {string} text to display inside a paragraph of the default HTML, if data cannot be converted as expected
   * @param logger - optional logger instance, logs conversion error that causes default HTML rendering
   *
   * @returns - see convert()
   */
  static async convertWithDefault(htmlInfo, data, message, logger) {
    let html;
    try {
      html = await HtmlConverter.convert(htmlInfo, data);
    } catch (error) {
      if (logger) {
        logger.error('HTML conversion renders default HTML because: ' + error.message);
      }
      html = `<html lang="en"><head><meta charset="utf-8"></head><body><p>${message ? message : 'Default HTML contents - no message given'}</p></body></html>`;
    }
    return html;
  }

};
