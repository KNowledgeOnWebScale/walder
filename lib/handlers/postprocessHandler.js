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
  handle(data, pipeFunctions) {
    const keys = Object.keys(data);

    return keys.reduce((acc, val) => {
      acc[val] = Utils.pipe(pipeFunctions)(data[val]).data;
      return acc;
    }, {});
  }
};
