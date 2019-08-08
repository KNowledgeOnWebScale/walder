const StringBuilder = require('string-builder');
const fs = require('fs');

/**
 * Writer interface.
 *
 * Writers are used to generate and output the NodeJS/Express code.
 *
 * @type {module.Writer}
 */
module.exports = class Writer {
    constructor(output) {
        this.output = output;
        this.sb = new StringBuilder();
    }

    preWrite() {
        fs.appendFileSync(this.output, this.sb.toString());
        this.sb.clear();
    }

    write(data) {
        fs.appendFileSync(this.output, this.sb.toString());
        this.sb.clear();
    }

    postWrite() {
        fs.appendFileSync(this.output, this.sb.toString());
        this.sb.clear();
    }
};