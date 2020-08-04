'use strict';

const Parser = require('./parser');
const path = require('path');
const fs = require('fs');

const DEFAULT_RESOURCES = {
  views: '',
  pipeModules: '',
  public: 'public',
  layouts: 'layouts'
};

/**
 * Parses the resources section and returns a { path, views, pipeModules, public, layouts } object.
 *
 * @type {module.ResourceParser}
 */
module.exports = class ResourceParser extends Parser {
  constructor() {
    super();
  }

  /**
   * This function parses the resource paths and returns them as absolute paths.
   * @param {Object} data - The object with the resource paths from the config file.
   * @param cwd - The absolute path used to create absolute paths from for relative paths.
   * @returns {{}|{public: string, layouts: string, views: string, pipeModules: string}}
   */
  static parse(data, cwd) {
    if (!path.isAbsolute(cwd)) {
      throw new Error('The parameter "cwd" is not an absolute path.');
    }

    const resources = {};

    if (data) {
      if (data.path) {
        if (path.isAbsolute(data.path)) {
          resources.path = data.path;
        } else {
          resources.path = path.resolve(cwd, data.path);
        }
      } else {
        resources.path = cwd;
      }

      resources.views = data.views ? data.views : DEFAULT_RESOURCES.views;

      if (!path.isAbsolute(resources.views)) {
        resources.views = path.resolve(resources.path, resources.views);
      }

      resources['pipe-modules'] = data['pipe-modules'] ? data['pipe-modules'] : DEFAULT_RESOURCES.pipeModules;
      if (!path.isAbsolute(resources['pipe-modules'])) {
        resources['pipe-modules'] = path.resolve(resources.path, resources['pipe-modules']);
      }

      resources.public = data.public ? data.public : DEFAULT_RESOURCES.public;
      if (!path.isAbsolute(resources.public)) {
        resources.public = path.resolve(resources.path, resources.public);
      }
      // check if public directory already exists, create if not
      if (!fs.existsSync(resources.public)) {
        fs.mkdirSync(resources.public, {recursive: true});
      }

      resources.layouts = data.layouts ? data.layouts : DEFAULT_RESOURCES.layouts;
      if (!path.isAbsolute(resources.layouts)) {
        resources.layouts = path.resolve(resources.path, resources.layouts);
      }

      return resources;
    } else {
      const parsedDefaultResources = {...DEFAULT_RESOURCES};

      for (const p of parsedDefaultResources) {
        parsedDefaultResources[p] = path.resolve(cwd, parsedDefaultResources[p]);
      }

      return parsedDefaultResources;
    }
  }
};
