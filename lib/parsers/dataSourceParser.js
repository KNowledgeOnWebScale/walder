const Parser = require('./parser');

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
    for (let type in this.data) {
      for (let source in this.data[type]) {
        datasources.push({type: type, value: this.data[type][source]});
      }
    }

    return datasources;
  }
};