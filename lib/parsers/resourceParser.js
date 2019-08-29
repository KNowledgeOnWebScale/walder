'use strict';

const Parser = require('./parser');
const Path = require('path');
const fs = require('fs');

const DEFAULT_RESOURCES = {
  path: './',
  views: '',
  pipeModules: '',
  public: 'public'
};

/**
 * Parses the resources section and returns a { path, views, pipeModules, public } object.
 *
 * @type {module.ResourceParser}
 */
module.exports = class ResourceParser extends Parser {
  constructor() {
    super();
  }

  static parse(data, configFile) {
    const resources = {};
    if (data) {
      if (data.path) {
        if (Path.isAbsolute(data.path)) {
          resources.path = data.path;
        } else {
          resources.path = Path.resolve(Path.dirname(configFile), data.path);
        }
      } else {
        resources.path = Path.resolve(DEFAULT_RESOURCES.path);
      }

      resources.views = data.views ? data.views : DEFAULT_RESOURCES.views;
      if (!Path.isAbsolute(resources.views)) {
        resources.views = Path.resolve(resources.path, resources.views)
      }

      resources['pipe-modules'] = data['pipe-modules'] ? data['pipe-modules'] : DEFAULT_RESOURCES.pipeModules;
      if (!Path.isAbsolute(resources['pipe-modules'])) {
        resources['pipe-modules'] = Path.resolve(resources.path, resources['pipe-modules']);
      }

      resources.public = data.public ? data.public : DEFAULT_RESOURCES.public;
      if (!Path.isAbsolute(resources.public)) {
        resources.public = Path.resolve(resources.path, resources.public);
      }
      // check if public directory already exists, create if not
      if (!fs.existsSync(resources.public)) {
        fs.mkdirSync(resources.public, {recursive: true});
      }

      return resources;
    }
    else {
      return DEFAULT_RESOURCES;
    }
  }
};