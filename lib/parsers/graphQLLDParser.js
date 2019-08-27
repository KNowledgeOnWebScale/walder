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

  static parse(data, defaultDatasources) {
    if (data) {
      // Extract the context
      const context = JSON.parse(data['json-ld-context']);

      // Extract the query
      const query = data['graphql-query'].replace(/\n/g, '').replace(/[ ]+/g, ' ');

      // Extract the datasources
      let datasources = defaultDatasources;

      // Check for path specific datasources
      if (data.datasources) {
        if (data.datasources.additional) {
          datasources = [...new Set([...datasources, ...data.datasources.sources])]; // Union of default and additional datasources
        } else {
          datasources = data.datasources.sources;
        }
      }

      return new GraphQLLDInfo(query, context, datasources);
    } else {
      return undefined;
    }
  }
};