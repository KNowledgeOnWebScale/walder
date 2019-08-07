const StringBuilder = require('string-builder');

module.exports = class Writer {
    constructor(output) {
        this.output = output;
        this.sb = new StringBuilder();
    }

    preWrite() {
    }

    write(data) {
    }

    postWrite() {
    }
};