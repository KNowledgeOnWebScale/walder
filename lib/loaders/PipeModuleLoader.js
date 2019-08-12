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

    load() {
        const sources = this.data.map(pipeModule => pipeModule.source);

        return axios.all(sources.map(source => axios.get(source)))
            .then((res) => {
                    let pipeModules = [];

                    res.forEach((pipeModule, index) => {
                        this.data[index].code = pipeModule.data.trim();
                        this.data[index].function = new Function('data', this.data[index].code);    // todo: add arguments
                        pipeModules.push(this.data[index]);
                    });

                    return pipeModules;
                }
            );
    }

};



