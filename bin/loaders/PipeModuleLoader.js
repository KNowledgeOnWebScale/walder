const Loader = require('./loader');
const axios = require('axios');

/**
 * Loads pipe modules.
 *
 * @type {module.PipeModuleLoader}
 */
module.exports = class PipeModuleLoader extends Loader {
    constructor(data) {
        super(data);
    }

    async load() {
        let pipeModules = [];
        const sources = this.data.map(pipeModule => pipeModule.source);

        const res = await axios.all(sources.map(source => axios.get(source)))

        res.forEach((pipeModule, index) => {
            this.data[index].code = pipeModule.data.trim();
            pipeModules.push(this.data[index]);
        });

        return pipeModules;
    }

};



