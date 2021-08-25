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
    const keys = Object.keys(data);

    for (let i = 0; i < keys.length; i ++) {
      const key = keys[i];
      data[key] = (await Utils.pipe(pipeFunctions, data[key])).data;
    }

    return data;
  }
};
