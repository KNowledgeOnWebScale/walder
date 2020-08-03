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

  static parse(data, configFile, cwd) {
    const resources = {};

    if (data) {
      if (data.path) {
        if (path.isAbsolute(data.path)) {
          resources.path = data.path;
        } else {
          resources.path = path.resolve(path.dirname(configFile), data.path);
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
