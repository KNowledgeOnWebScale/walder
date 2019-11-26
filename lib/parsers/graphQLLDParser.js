'use strict';

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

  static parse(data, defaultDatasources, cache) {
    if (data) {
      // Extract the context
      const context = JSON.parse(data['json-ld-context']);

      // Extract the query
      let queries = data['graphql-query'];
      if (typeof queries === 'string')
        queries = { 'data': queries };
      Object.keys(queries).forEach(key => queries[key] = queries[key].replace(/\n/g, '').replace(/[ ]+/g, ' '));

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

      // Create the comunica config object
      const comunicaConfig = {
        sources: datasources
      };

      return new GraphQLLDInfo(queries, context, comunicaConfig, cache);
    } else {
      return undefined;
    }
  }
};