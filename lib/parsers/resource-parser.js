'use strict';

const path = require('path');
const fs = require('fs');

const DEFAULT_RESOURCES = {
  views: 'views',
  'pipe-modules': 'pipe-modules',
  public: 'public',
  layouts: 'layouts'
};

/**
 * This function parses the resource paths and returns them as absolute paths.
 * @param {Object} data - The object with the resource paths from the config file.
 * @param cwd - The absolute path used to create absolute paths from for relative paths.
 * @param logger - A Winston instance.
 * @returns {{}|{public: string, layouts: string, views: string, pipe-modules: string}}
 */
module.exports = (data, cwd, logger = null) => {
  if (!path.isAbsolute(cwd)) {
    throw new Error('The parameter "cwd" is not an absolute path.');
  }

  const resources = {};

  if (data) {
    if (data.path) {
      if (logger) {
        this.logger.warn(`"x-walder-resources.root" is deprecated. Use "x-walder-resources.root" instead.`);
      }

      data.root = data.path;
    }

    if (data.root) {
      if (path.isAbsolute(data.root)) {
        resources.root = data.root;
      } else {
        resources.root = path.resolve(cwd, data.root);
      }
    } else {
      resources.root = cwd;
    }

    resources.views = data.views ? data.views : DEFAULT_RESOURCES.views;

    if (!path.isAbsolute(resources.views)) {
      resources.views = path.resolve(resources.root, resources.views);
    }

    resources['pipe-modules'] = data['pipe-modules'] ? data['pipe-modules'] : DEFAULT_RESOURCES['pipe-modules'];
    if (!path.isAbsolute(resources['pipe-modules'])) {
      resources['pipe-modules'] = path.resolve(resources.root, resources['pipe-modules']);
    }

    resources.public = data.public ? data.public : DEFAULT_RESOURCES.public;
    if (!path.isAbsolute(resources.public)) {
      resources.public = path.resolve(resources.root, resources.public);
    }
    // check if public directory already exists, create if not
    if (!fs.existsSync(resources.public)) {
      fs.mkdirSync(resources.public, {recursive: true});
    }

    resources.layouts = data.layouts ? data.layouts : DEFAULT_RESOURCES.layouts;
    if (!path.isAbsolute(resources.layouts)) {
      resources.layouts = path.resolve(resources.root, resources.layouts);
    }

    return resources;
  } else {
    const parsedDefaultResources = {...{root: cwd}, ...DEFAULT_RESOURCES};

    for (const p in parsedDefaultResources) {
      parsedDefaultResources[p] = path.resolve(cwd, parsedDefaultResources[p]);
    }

    return parsedDefaultResources;
  }
};
