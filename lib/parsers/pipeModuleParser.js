const Parser = require('./parser');
const Path = require('path');

/**
 * Parses the pipe module sections.
 *
 * @type {module.PipeModuleParser}
 */
module.exports = class PipeModuleParser extends Parser {
  constructor(data, basePath) {
    super(data);
    this.basePath = basePath;
  }

  parse(path, method) {
    let pipeModules = [];

    for (const pipeModule in this.data.paths[path][method].postprocessing) {
      let source = this.data.paths[path][method].postprocessing[pipeModule].source;

      if (!Path.isAbsolute(source)) {
        source = Path.resolve(this.basePath, source);
      }

      pipeModules.push({
        name: pipeModule,
        source: source
      })
    }
    return pipeModules;
  }
};