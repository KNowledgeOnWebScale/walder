const StringBuilder = require('string-builder');

module.exports = class Writer {
    constructor(file) {
        this.file = file;
        this.sb = new StringBuilder();
    }

    preWrite() {
    }

    write(data) {
    }

    postWrite() {
    }
};