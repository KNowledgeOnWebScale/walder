'use strict';

const Handler = require('./handler');

const isEmpty = require('is-empty'); // Used to check if an object is empty
const Client = require('graphql-ld').Client;
const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;

// Comunica query engines cache
// Saved by stringified list of sorted datasources
const COMUNICA_ENGINE_CACHE = {};

/**
 * Handles GraphQL-LD querying.
 *
 * @type {module.GraphQLLDHandler}
 */
module.exports = class GraphQLLDHandler extends Handler {
  constructor() {
    super();
  }

  /**
   * Instantiates the variables in the given GraphQL-LD query using the given path variables and query parameters,
   * then executes the given GraphQL-LD query using comunica.
   *
   * @param graphQLLDInfo, object containing the comunica configuration, cache setting, the GraphQL query and the JSON-LD context
   * @param variables, object containing path parameters to value mapping
   * @param queryParams, object containing query parameter to value mapping
   * @returns {Promise<>}, GraphQL-LD query results
   */
  static async handle(graphQLLDInfo, variables, queryParams) {
    let newQuery = this.substituteVariables(graphQLLDInfo.query, variables);
    newQuery = this.substituteQueryParams(newQuery, queryParams);

    const clientConfig = {
      context: graphQLLDInfo.context,
    };

    // If cache is enabled --> search for the engine in cache
    if (graphQLLDInfo.cache) {
      // Sort the data sources before looking in cache
      graphQLLDInfo.comunicaConfig.sources.sort();

      if (!(graphQLLDInfo.comunicaConfig.sources.toString() in COMUNICA_ENGINE_CACHE)) {
        COMUNICA_ENGINE_CACHE[graphQLLDInfo.comunicaConfig.sources.toString()] = new QueryEngineComunica(graphQLLDInfo.comunicaConfig);
        console.debug('Comunica query engine cache: MISS');
      } else {
        console.debug('Comunica query engine cache: HIT');
      }
      clientConfig.queryEngine = COMUNICA_ENGINE_CACHE[graphQLLDInfo.comunicaConfig.sources.toString()];
    } else {  // --> create a new one
      clientConfig.queryEngine = new QueryEngineComunica(graphQLLDInfo.comunicaConfig);
    }

    const client = new Client(clientConfig);

    return await client.query({
      query: newQuery
    })
  }

  /**
   * Instantiates the given variables in the query.
   *
   * @param query
   * @param variables
   *
   * @returns string (newQuery)
   */
  static substituteVariables(query, variables) {
    if (!isEmpty(variables)) {
      let newQuery = query;
      Object.keys(variables).forEach(key => {
        // Replace underscores with spaces
        let val = variables[key];
        if (typeof val === 'string' || val instanceof String) {
          val = '"' + val.replace(/_/g, ' ') + '"';
        }
        newQuery = newQuery.replace('$' + key, val);
      });
      return newQuery;
    } else {
      return query;
    }
  };

  /**
   * Instantiates the given query parameters in the query.
   * Pagination parameters are converted to GraphQL format.
   *
   * @param query
   * @param params
   *
   * @returns string (newQuery)
   */
  static substituteQueryParams(query, params) {
    if (!isEmpty(params)) {
      const keys = Object.keys(params);
      // Pagination parameters to GraphQL format
      if (keys.includes('page') && keys.includes('limit')) {
        params.limit = Number(params.limit);
        params.offset = Number(params.page) * params.limit;
      }
      delete params.page;
      return this.substituteVariables(query, params);
    } else {
      return query;
    }
  };

  /**
   * Returns the cache (mainly used for testing).
   */
  static getCache() {
    return COMUNICA_ENGINE_CACHE;
  }
};