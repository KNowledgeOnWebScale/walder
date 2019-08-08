/**
 * Loader interface.
 *
 * Loaders are used to load data from external sources.
 *
 * @type {module.Loader}
 */
module.exports = class Loader {
    constructor(data) {
        this.data = data;
    }

    load() {
    }
};