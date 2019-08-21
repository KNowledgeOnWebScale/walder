const Parser = require('./parser');
const GraphQLLDInfo = require('../models/graphQLLDInfo');

/**
 * Parses the GraphQL-LD information and returns it as a GraphQLLDInfo object.
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

    return new GraphQLLDInfo(query, context);
  }
};