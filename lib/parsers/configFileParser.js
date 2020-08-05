'use strict';

const YAML = require('yaml');
const fs = require('fs');
const JSREF = require('json-refs');

module.exports = async (configFilePath) => {
    const file = fs.readFileSync(configFilePath, 'utf8');
    let yamlObj = YAML.parse(file);

    // Replace $ref in the configFilePath with the corresponding .yaml files
    let options = {
        filter: ['relative', 'remote'],
        loaderOptions: {
            processContent: function (res, callback) {
                // Parse the corresponding .yaml file to objects
                callback(YAML.parse(res.text));
            }
        },
        location: configFilePath
    };

    // resolve all the references
    return (await JSREF.resolveRefs(yamlObj, options)).resolved;
}
