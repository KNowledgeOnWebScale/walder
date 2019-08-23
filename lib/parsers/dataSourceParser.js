const Parser = require('./parser');

/**
 * Parses the data source sections and converts them into { type: ... , value: ... } objects.
 * E.g. { type: "sparql", value: "https://dbpedia.org/sparql" }
 *
 * @type {module.DataSourceParser}
 */
module.exports = class DataSourceParser extends Parser {
  constructor() {
    super();
  }

  static parse(data) {
    let datasources = [];
    for (let type in data) {
      for (let source in data[type]) {
        datasources.push({type: type, value: data[type][source]});
      }
    }

    return datasources;
  }
};