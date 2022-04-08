'use strict';

const path = require('path');
const objectPath = require('object-path');

// set of extensions that should be replaced
const extensionReplacements = {
  'njk': 'nunjuck'
}

/**
 * Applies given pipe modules (functions) to the given data.
 *
 * @param fns - List of pipe functions
 * @param data - The data that is processed by the pipe functions
 * @param queryKey - The key of the query that resulted in the given data
 * @returns {function(*=): (*)}
 */
const pipe = async (fns, data, queryKey) => {
  for (let i = 0; i < fns.length; i ++) {
    const f = fns[i];
    const parameters = [...f.parameters];

    if (parameters.length > 0 && parameters[0] !== '_data'){
      const object_path = parameters[0].slice(1);
      parameters[0] = objectPath.get(data, object_path);
      objectPath.set(data, object_path, f.function(...parameters));
    }

    parameters[0] = data;

    if (queryKey) {
      parameters.push(queryKey);
    }

    data = await f.function(...parameters);
  }

  return data;
};

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
