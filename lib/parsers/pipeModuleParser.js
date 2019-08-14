const Parser = require('./parser');

/**
 * Parses the pipe module sections.
 *
 * @type {module.PipeModuleParser}
 */
module.exports = class PipeModuleParser extends Parser {
  constructor(data) {
    super(data);
  }

  parse(path, method) {
    let pipeModules = [];
    for (const pipeModule in this.data.paths[path][method].postprocessing) {
      pipeModules.push({
        name: pipeModule,
        source: this.data.paths[path][method].postprocessing[pipeModule].source
      })
    }
    return pipeModules;
  }
};