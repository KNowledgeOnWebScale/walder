const Parser = require('./parser');

module.exports = class PipeModuleParser extends Parser {
    constructor(method, path, data) {
        super(data);
        this.method = method;
        this.path = path;
    }

    parse() {

    }
}