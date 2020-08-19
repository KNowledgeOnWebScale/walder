'use strict';

const HTMLInfo = require('../models/html-info');
const {getEngineFromFilePath} = require('../utils');
const path = require('path');

/**
 * Parses the HTML template information and returns it as a {statusCode: HTMLInfo} object.
 */
module.exports = (data, basePath, layoutsDir) => {
  const result = {};

  // Extract the file
  for (const statusCode in data) {
    let file = data[statusCode]['x-walder-input-text/html'];
    if (!path.isAbsolute(file)) {
      file = path.resolve(basePath, file);
    }

    // Extract the engine
    const engine = getEngineFromFilePath(file);

    result[statusCode] = new HTMLInfo(engine, file, data[statusCode].description, layoutsDir);
  }

  return result;
};
