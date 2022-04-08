'use strict';

const Handler = require('./handler');
const Utils = require('../utils');

/**
 * Handles the postprocessing of query results.
 *
 * @type {module.PostprocessHandler}
 */
module.exports = class PostprocessHandler extends Handler {
  constructor() {
    super();
  }

  /**
   * This function executes pipe modules on query results.
   * @param data - The query results on which the pipe modules are executed.
   * @param pipeFunctions - Array of pipe functions.
   * @returns {{}} The result of the pipe modules.
   */
  async handle(data, pipeFunctions) {
    let keys = Object.keys(data);
    const queryResultsPipeFunctionsMap = {};

    pipeFunctions.forEach(pipeFunction => {
      if (pipeFunction.queryResults) {
        pipeFunction.queryResults.sort();
        const qrKey = pipeFunction.queryResults.join();

        if (!queryResultsPipeFunctionsMap[qrKey]) {
          queryResultsPipeFunctionsMap[qrKey] = [];
        }

        queryResultsPipeFunctionsMap[qrKey].push(pipeFunction);
      } else {
        keys.forEach(queryResult => {
          if (!queryResultsPipeFunctionsMap[queryResult]) {
            queryResultsPipeFunctionsMap[queryResult] = [];
          }

          queryResultsPipeFunctionsMap[queryResult].push(pipeFunction);
        })
      }
    });

    const updatedKeys = Object.keys(queryResultsPipeFunctionsMap);

    for (let i = 0; i < updatedKeys.length; i ++) {
      const key = updatedKeys[i];

      if (keys.includes(key)) {
        data[key] = (await Utils.pipe(queryResultsPipeFunctionsMap[key], data[key], key));
      } else {
        data = (await Utils.pipe(queryResultsPipeFunctionsMap[key], data));
      }
    }

    return data;
  }
};
