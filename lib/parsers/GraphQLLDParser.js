const Parser = require('./parser');
const util = require('util');

class GraphQLLD {
  constructor(query, context) {
    this.query = query;
    this.context = context;
  }
}

/**
 * Parses the GraphQL-LD sections and converts them into GraphQLLD objects.
 *
 * @type {module.GraphQLLDParser}
 */
module.exports = class GraphQLLDParser extends Parser {
  constructor(data) {
    super(data);
  }

  parse(path, method) {
    // Extract the context
    const context = JSON.parse(this.data.paths[path][method]['json-ld-context']);
    // Extract the query
    const query = this.data.paths[path][method]['graphql-query'].replace(/\n/g, '').replace(/[ ]+/g, ' ');

    return new GraphQLLD(query, context);
  }
};