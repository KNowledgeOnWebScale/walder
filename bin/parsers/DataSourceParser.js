const Parser = require('./parser');

module.exports = class DataSourceParser extends Parser {
    constructor(data) {
        super(data);
    }

    parse() {
        let datasources = [];

        for (let type in this.data.datasources) {
            for (let source in this.data.datasources[type]) {
                datasources.push({type: type, value: this.data.datasources[type][source]});
            }
        }

        return datasources;
    }
};