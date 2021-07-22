'use strict';

const path = require('path');
const objectPath = require('object-path');

//set of extensions that should be replaced
const extensionReplacements = {
  'njk': 'nunjuck'
}

/**
 * Applies given pipe modules (functions) to the given data.
 *
 * @param fns - List of pipe functions
 * @returns {function(*=): (*)}
 */
const pipe = (fns) => (x) => fns.reduce((v, f) => {
    let parameters = [...f.parameters];
    if (parameters.length > 0 && parameters[0] !== '_data'){
        const object_path = parameters[0].slice(1);
        parameters[0] = objectPath.get(v, object_path);
        objectPath.set(v, object_path, f.function(...parameters));
        return v;
    }
    parameters[0] = v;
    return f.function(...parameters);
  }, x);

/**
 * Print an error without stack trace and stop execution.
 * @param msg
 */
const printError = (msg) => {
  console.error('\n' + msg + '\n');
  process.exit(1);
};

function getEngineFromFilePath(filePath) {
  let extension = path.extname(filePath).slice(1);
  //replace some extensions
  if(extension in extensionReplacements){
    return extensionReplacements[extension];
  }
  return extension;
}

module.exports = {
  pipe,
  printError,
  getEngineFromFilePath
};
