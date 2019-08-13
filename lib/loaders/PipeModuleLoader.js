const Loader = require('./Loader');
const axios = require('axios');
const fs = require('fs');
const RESOURCES = require('../pipeModules/resources');
const StringBuilder = require('string-builder');
const Path = require('path');

const OUTPUT_FILE = Path.resolve(__dirname, '../pipeModules/pipeModules.js');

/**
 * Loads pipe modules.
 * Writes the retrieved pipe modules to 'walter.js/pipeModules/pipeModules.js'
 *
 * @type {module.PipeModuleLoader}
 */
module.exports = class PipeModuleLoader extends Loader {
  constructor() {
    super();
    this.sb = new StringBuilder();
    this.pipeModules = new Set();
  }

  /**
   * Loads local and remote pipe modules.
   *
   * @param pipeModules, list of pipe module objects {name, source}
   */
  load(pipeModules) {
    this.preLoad();

    const remoteSources = [];

    pipeModules.forEach((pipeModule) => {
      if (!this.pipeModules.has(pipeModule.name)) {
        this.pipeModules.add(pipeModule.name);

        if (pipeModule.source.includes('http://') || pipeModule.source.includes('https://')) {
          remoteSources.push(pipeModule);
        } else {
          this.loadLocal(pipeModule.source);
        }
      }
    });

    this.loadRemotes(remoteSources);
  }

  /**
   * Clear the output file.
   */
  preLoad() {
    fs.writeFileSync(OUTPUT_FILE, '');
  }

  postLoad() {
    this.sb.append(RESOURCES.EXPORT_START);

    this.pipeModules.forEach(pipeModule => {
      this.sb.appendFormat(RESOURCES.EXPORT_OBJECT, pipeModule);
    });

    fs.appendFileSync(OUTPUT_FILE, this.sb.toString());
    fs.appendFileSync(OUTPUT_FILE, RESOURCES.EXPORT_END);
  }

  /**
   * Load remote pipe modules, downloading and writing them to the output file.
   *
   * @param pipeModules
   * @returns {PromiseLike<Array> | Promise<Array>}
   */
  loadRemotes(pipeModules) {
    Promise.all(pipeModules.map(pipeModule => axios.get(pipeModule.source)))
      .then((res) => {
          let pipeModules = [];

          res.forEach((pipeModule) => {
            fs.appendFileSync(OUTPUT_FILE, '\n' + pipeModule.data.trim());
          });

          return pipeModules;
        }
      );
  }

  /**
   * Load local pipe modules, copying the code from the original location to the output file.
   *
   * @param path, path to original code location
   */
  loadLocal(path) {
    const xx = Path.resolve(__dirname, '../../../' + path);
    fs.readFile(xx, 'utf8', (error, contents) => {
      fs.appendFileSync(OUTPUT_FILE, '\n' + contents.trim());
    })
  }
};

