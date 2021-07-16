'use strict';

const Converter = require('./converter');
const cons = require('consolidate');
const fs = require('fs-extra');
const MarkdownIt = require('markdown-it');
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

  constructor(templateLoader, options = {logger: null}) {
    super();

    this.logger = options.logger;
    this.templateLoader = templateLoader;
  }

  /**
   * This method generates HTML.
   * @param htmlInfo - The information about HTML (path, engine)
   * @param data - The JSON data that is used by the engine to substitute variables.
   * @returns {Promise<void>}
   */
  convert(htmlInfo, data) {
    return new Promise(async (resolve, reject) => {
      let content;

      try {
        if (this.logger) {
          this.logger.debug(`Reading file "${htmlInfo.file}" from disk.`);
        }

        content = this.templateLoader.load(htmlInfo);

        if (this.logger) {
          this.logger.debug(`Done reading file "${htmlInfo.file}" from disk.`);
        }
      } catch (err) {
        reject(err);
      }

      // FrontMatter metadata as additional attributes in original data
      data = {...data, ...content.attributes};

      try {
        if (content.attributes.layout) {
          try {
            const layoutPath = path.join(htmlInfo.layoutsDir, content.attributes.layout);
            const layoutEngine = getEngineFromFilePath(layoutPath);

            if (this.logger) {
              this.logger.debug(`Generating HTML using template "${htmlInfo.file}".`);
            }

            const layoutDataContent = await this._convertToHTML(htmlInfo.engine, content.body, htmlInfo.file, data);

            if (this.logger) {
              this.logger.debug(`Done generating HTML using template "${htmlInfo.file}".`);
            }
            // FrontMatter metadata as additional attributes in layout data
            const layoutData = {content: layoutDataContent, ...content.attributes};

            if (this.logger) {
              this.logger.debug(`Generating HTML using layout "${layoutPath}".`);
            }

            const html = await this.convert(new HTMLInfo(layoutEngine, layoutPath, htmlInfo.description, htmlInfo.layoutsDir), layoutData);

            if (this.logger) {
              this.logger.debug(`Done generating HTML using layout "${layoutPath}".`);
            }

            resolve(html);
          } catch (err) {
            reject(err);
          }
        } else {
          if (this.logger) {
            this.logger.debug(`Generating HTML using template "${htmlInfo.file}".`);
          }

          resolve(await this._convertToHTML(htmlInfo.engine, content.body, htmlInfo.file, data));

          if (this.logger) {
            this.logger.debug(`Done generating HTML using template "${htmlInfo.file}".`);
          }
        }
      } catch(err) {
        const error = new Error(`Converting to HTML failed.`);
        error.type = 'HTML_CONVERSION_FAILED';

        reject(error);
      }
    });
  }

  async _convertToHTML(engine, fileContent, filePath, data) {
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
