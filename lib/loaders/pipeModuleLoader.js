'use strict';

const Loader = require('./loader');

/**
 * Loads pipe modules.
 * Writes the retrieved pipe modules to 'walder.js/pipeModules/pipeModules.js'
 *
 * @type {module.PipeModuleLoader}
 */
module.exports = class PipeModuleLoader extends Loader {
  constructor() {
    super();
  }

  /**
   * Loads local and remote pipe modules.
   *
   * @param pipeModules, list of pipe module objects {name, source}
   * @returns [pipeFunction], list of pipe functions
   */
  static load(pipeModules) {
    return pipeModules.map((pipeModule) => {
      const fn = require(pipeModule.source)[pipeModule.name];

      if (!fn) {
        const message = `Pipe module "${pipeModule.name}" was not found in ${pipeModule.source}`;
        throw new Error(message);
      }

      return fn;
    });
  }
};

