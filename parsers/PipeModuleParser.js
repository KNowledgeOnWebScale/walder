const Parser = require('./parser');

module.exports = class PipeModuleParser extends Parser {
    constructor(data) {
        super(data);
    }

    parse() {
        let pipeModules = [];
        for (const pipeModule in this.data) {
            pipeModules.push({
                name: pipeModule,
                source: this.data[pipeModule].source
            })
        }
        return pipeModules;
    }
};