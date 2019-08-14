const Loader = require('./loader');
const path = require('path');

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
    const pipeFunctions = [];

    pipeModules.forEach((pipeModule) => {
      pipeFunctions.push(require(path.resolve(__dirname, '../../../' + pipeModule.source))[pipeModule.name]);
    });

    return pipeFunctions;
  }
};

