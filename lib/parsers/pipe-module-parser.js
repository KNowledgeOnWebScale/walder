'use strict';

const Path = require('path');

/**
 * Parses pipe module data of config file.
 * @param data
 * @param basePath
 * @returns {[]}
 */
module.exports = (data, basePath) => {
  let pipeModules = [];

  for (const pipeModule in data) {
    let source = data[pipeModule].source;

    if (!Path.isAbsolute(source)) {
      source = Path.resolve(basePath, source);
    }

    let parameters = [];

    if (data[pipeModule].parameters) {
      parameters = data[pipeModule].parameters;
    }

    pipeModules.push({
      name: pipeModule,
      source: source,
      parameters: parameters
    });
  }
  return pipeModules;
};
