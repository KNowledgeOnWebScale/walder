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

  static parse(data, defaultDatasources, cache, parameters = []) {
    if (data) {
      // Extract the context
      const context = JSON.parse(data['json-ld-context']);

      // Extract the global options (sort/duplicate/...)
      const options = data['options'];

      // Extract the query
      let queries = data['graphql-query'];
      if (typeof queries === 'string')
        queries = { 'data': {query: queries} };
      Object.keys(queries).forEach(key => {

        // if there is no query key in the object, link the query to a query key
        if (!queries[key].query){
          queries[key] = {query: queries[key]};
        }
        // if there are global options, add them to every query
        if (options){
          queries[key].options = options;
        }
      });
      Object.keys(queries).forEach(key => queries[key].query = queries[key].query.replace(/\n/g, '').replace(/[ ]+/g, ' '));
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


      return new GraphQLLDInfo(queries, context, comunicaConfig, cache, parameters);
    } else {
      return undefined;
    }
  }
};
