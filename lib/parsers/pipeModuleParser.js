'use strict';

const Parser = require('./parser');
const Path = require('path');

/**
 * Parses the pipe module sections.
 *
 * @type {module.PipeModuleParser}
 */
module.exports = class PipeModuleParser extends Parser {
  constructor() {
    super();
  }

  static parse(data, basePath) {
    let pipeModules = [];

    for (const pipeModule in data) {
      let source = data[pipeModule].source;

      if (!Path.isAbsolute(source)) {
        source = Path.resolve(basePath, source);
      }

      let parameters = [];

      if (data[pipeModule].parameters){
        parameters = data[pipeModule].parameters;
      }

      pipeModules.push({
        name: pipeModule,
        source: source,
        parameters: parameters
      });
    }
    return pipeModules;
  }
};
