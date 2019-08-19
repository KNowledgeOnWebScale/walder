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
  load(pipeModules, basePath) {
    const pipeFunctions = [];

    pipeModules.forEach((pipeModule) => {
      // Load absolute or relative path
      let source = pipeModule.source;
      if (!path.isAbsolute(source)) {
        source = path.resolve(basePath, pipeModule.source);
      }
      pipeFunctions.push(require(source)[pipeModule.name]);
    });

    return pipeFunctions;
  }
};

