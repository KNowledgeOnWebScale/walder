const Parser = require('./parser');
const GraphQLLDInfo = require('../models/graphQLLDInfo');

/**
 * Parses the GraphQL-LD information and returns it as a GraphQLLDInfo object.
 *
 * @type {module.GraphQLLDParser}
 */
module.exports = class GraphQLLDParser extends Parser {
  constructor() {
    super();
  }

  static parse(data) {
    if (data['json-ld-context'] && data['graphql-query']) {
      // Extract the context
      const context = JSON.parse(data['json-ld-context']);
      // Extract the query
      const query = data['graphql-query'].replace(/\n/g, '').replace(/[ ]+/g, ' ');

      return new GraphQLLDInfo(query, context);
    } else {
      return undefined;
    }
  }
};