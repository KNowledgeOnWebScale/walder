const Parser = require('./Parser');

/**
 * Parses the data source sections and converts them into { type: ... , value: ... } objects.
 * E.g. { type: "sparql", value: "https://dbpedia.org/sparql" }
 *
 * @type {module.DataSourceParser}
 */
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