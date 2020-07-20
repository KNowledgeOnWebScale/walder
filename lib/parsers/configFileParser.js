'use strict';

const Parser = require('./parser');
const YAML = require('yaml');
const fs = require('fs');
const JSREF = require('json-refs');

/**
 * Parses the .yaml config file to an object that can be used.
 * Also resolves references if they are used in the config file.
 *
 * Returns a object with all the data from the config file.
 *
 * @type {module.ConfigFileParser}
 */
module.exports = class ConfigFileParser extends Parser {
    constructor() {
        super();
    }

    static async parse(configFile) {
        const file = fs.readFileSync(configFile, 'utf8');
        let yamlData = YAML.parse(file);


        // Replace $ref in the configFile with the corresponding .yaml files
        let options = {
            filter: ['relative', 'remote'],
            loaderOptions: {
                processContent: function (res, callback) {
                    // Parse the corresponding .yaml file to objects
                    callback(YAML.parse(res.text));
                }
            }
        };

        // resolve all the references
        await JSREF.resolveRefs(yamlData, options)
            .then(res => {
                yamlData = res.resolved;
            });
        return yamlData;
    }
};
