const Loader = require('./loader');
const axios = require('axios');
const fs = require('fs');
const RESOURCES = require('../pipeModules/resources');
const StringBuilder = require('string-builder');
const OUTPUT_FILE = '/Users/driesmarzougui/Documents/work/IDLab/KNoWS/walter/lib/pipeModules/pipeModules.js';

/**
 * Loads pipe modules.
 *
 * @type {module.PipeModuleLoader}
 */
module.exports = class PipeModuleLoader extends Loader {
    constructor() {
        super();
        this.sb = new StringBuilder();
        this.pipeModules = new Set();
    }

    async load(data) {
        this.preLoad();

        const remoteSources = [];

        data.forEach((pipeModule) => {
            if (! this.pipeModules.has(pipeModule.name)) {
                this.pipeModules.add(pipeModule.name);

                if (pipeModule.source.includes('http://') || pipeModule.source.includes('https://')) {
                    remoteSources.push(pipeModule);
                } else {
                    this.loadLocal(pipeModule.source);
                }
            }
        });

        await this.loadRemotes(remoteSources);
    }

    preLoad() {
        fs.writeFileSync(OUTPUT_FILE, RESOURCES.PIPE_FUNCTION);
    }

    postLoad() {
        this.sb.appendLine(RESOURCES.EXPORT_START);

        this.pipeModules.forEach(pipeModule => {
            this.sb.appendFormat(RESOURCES.EXPORT_OBJECT, pipeModule);
        });

        fs.appendFileSync(OUTPUT_FILE, this.sb.toString());
        fs.appendFileSync(OUTPUT_FILE, RESOURCES.EXPORT_END);
    }

    loadRemotes(pipeModules) {
        return axios.all(pipeModules.map(pipeModule => axios.get(pipeModule.source)))
            .then((res) => {
                    let pipeModules = [];

                    res.forEach((pipeModule) => {
                        fs.appendFileSync(OUTPUT_FILE, '\n' + pipeModule.data.trim());
                    });

                    return pipeModules;
                }
            );
    }

    loadLocal(path) {
        fs.readFile(path, 'utf8', (error, contents) => {
            fs.appendFileSync(OUTPUT_FILE, '\n' + contents.trim());
        })
    }
};



