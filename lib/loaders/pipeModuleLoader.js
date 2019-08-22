const Loader = require('./loader');
const Path = require('path');

/**
 * Loads pipe modules.
 * Writes the retrieved pipe modules to 'walter.js/pipeModules/pipeModules.js'
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
  load(pipeModules) {
    if (pipeModules) {
      return pipeModules.map((pipeModule) => {
        return require(pipeModule.source)[pipeModule.name]
      });
    } else {
      return [];
    }
  }
};
