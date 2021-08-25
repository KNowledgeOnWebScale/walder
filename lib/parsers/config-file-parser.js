'use strict';

const YAML = require('yaml');
const fs = require('fs');
const JSREF = require('json-refs');

module.exports = (configFilePath) => {
  return new Promise((resolve, reject) => {
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

    // Example that only resolves relative and remote references
    JSREF.resolveRefs(yamlObj, options)
      .then(function (res) {
        const keys = Object.keys(res.refs);
        let i = 0;

        while (i < keys.length && !res.refs[keys[i]].missing) {
          i++;
        }

        if (i < keys.length) {
          const error = new Error(`The referenced file at "${res.refs[keys[i]].fqURI}" does not exist.`);
          error.type = 'IO_INVALID_REF';

          reject(error);
        } else {
          resolve(res.resolved);
        }
      }, function (err) {
        reject(err);
      });
  });


  // resolve all the references
  //return (await JSREF.resolveRefs(yamlObj, options)).resolved;
}
