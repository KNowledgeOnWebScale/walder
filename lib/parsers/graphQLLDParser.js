'use strict';

const GraphQLLDInfo = require('../models/graphQLLDInfo');

const defaultOptions = {
  defaultDataSources: [],
  cache: true,
  parameters: []
}

/**
 * This function parses an x-walder-query object of a config file and returns the corresponding GraphQLLDInfo object.
 * @param data - An x-walder-query object.
 * @param options - An object with options for the function.
 * @param options.defaultDataSources - An array of default data sources.
 * @param options.cache - Use cache of Comunica when true.
 * @param options.parameters - An array of parameters that are associated with the same request as the query.
 * @returns A GraphQLLDInfo object.
 */
module.exports = (data, options = {}) => {
  const {defaultDataSources, cache, parameters} = {...defaultOptions, ...options};

  if (data) {
    // Extract the context
    let context = JSON.parse(data['json-ld-context']);

    // Support the smaller version of a context
    if (!context['@context']) {
      context = {'@context': context};
    }

    // Extract the global options (sort/duplicate/...)
    const options = data['options'];

    // Extract the query
    let queries = data['graphql-query'];
    if (typeof queries === 'string')
      queries = {'data': {query: queries}};
    Object.keys(queries).forEach(key => {

      // if there is no query key in the object, link the query to a query key
      if (!queries[key].query) {
        queries[key] = {query: queries[key]};
      }
      // if there are global options, add them to every query
      if (options) {
        queries[key].options = options;
      }
    });
    Object.keys(queries).forEach(key => queries[key].query = queries[key].query.replace(/\n/g, '').replace(/[ ]+/g, ' '));
    // Extract the data sources
    let dataSources = defaultDataSources;

    // Check for path specific data sources
    if (data.datasources) {
      if (data.datasources.additional) {
        dataSources = [...new Set([...dataSources, ...data.datasources.sources])]; // Union of default and additional dataSources
      } else {
        dataSources = data.datasources.sources;
      }
    }
    // Create the comunica config object
    const comunicaConfig = {
      sources: dataSources
    };

    return new GraphQLLDInfo(queries, context, comunicaConfig, cache, parameters);
  } else {
    return undefined;
  }
};
