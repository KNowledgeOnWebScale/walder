'use strict';

const path = require('path');

/**
 * Applies given pipe modules (functions) to the given data.
 *
 * @param fns, list of pipe functions
 * @returns {function(*=): (*)}
 */
const pipe = (fns) => (x) => fns.reduce((v, f) => f(v), x);

/**
 * Print an error without stack trace and stop execution.
 * @param msg
 */
const printError = (msg) => {
  console.error('\n' + msg + '\n');
  process.exit(1);
};

function getEngineFromFilePath(filePath) {
  return path.extname(filePath).slice(1);
}

module.exports = {
  pipe,
  printError,
  getEngineFromFilePath
};
