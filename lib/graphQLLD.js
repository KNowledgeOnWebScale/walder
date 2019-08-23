const isEmpty = require('is-empty'); // Used to check if an object is empty
const Client = require('graphql-ld').Client;
const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;


/**
 * Handles GraphQL-LD query execution.
 *
 * @type {module.GraphQLLD}
 */
module.exports = class GraphQLLD {
  /**
   * @param cache, boolean whether or not comunica query engines should be cached
   */
  constructor(cache) {
    this.cache = cache;

    // Comunica query engines cache
    // Saved by stringified list of sorted datasources
    this.queryEngineComunicaCache = {};
  }


  /**
   * Instantiates the variables in the given GraphQL-LD query using the given path variables and query parameters,
   * then executes the given GraphQL-LD query using comunica.
   *
   * @param comunicaConfig, Comunica engine configuration
   * @param graphQLLD, object containing the GraphQL query and JSON-LD context
   * @param variables, object containing path parameters to value mapping
   * @param queryParams, object containing query parameter to value mapping
   * @returns {Promise<>}, GraphQL-LD query results
   */
  executeQuery = async (comunicaConfig, graphQLLD, variables, queryParams) => {
    let newQuery = substituteVariables(graphQLLD.query, variables);
    newQuery = substituteQueryParams(newQuery, queryParams);

    // Sort the data sources before looking in cache
    comunicaConfig.sources.sort();

    const clientConfig = {
      context: graphQLLD.context,
    };

    // If cache is enabled --> search for the engine in cache
    if (this.cache) {
      if (! (comunicaConfig.sources.toString() in this.queryEngineComunicaCache)) {
        this.queryEngineComunicaCache[comunicaConfig.sources.toString()] = new QueryEngineComunica(comunicaConfig);
      }
      clientConfig.queryEngine = this.queryEngineComunicaCache[comunicaConfig.sources.toString()];
    } else {  // --> create a new one
      clientConfig.queryEngine = new QueryEngineComunica(comunicaConfig);
    }

    const client = new Client(clientConfig);

    return await client.query({
      query: newQuery
    })
  };
};

/**
 * Instantiates the given variables in the query.
 *
 * @param query
 * @param variables
 * @returns newQuery
 */
const substituteVariables = (query, variables) => {
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
 * @returns newQuery
 */
const substituteQueryParams = (query, params) => {
  if (!isEmpty(params)) {
    const keys = Object.keys(params);
    // Pagination parameters to GraphQL format
    if (keys.includes('page') && keys.includes('limit')) {
      params.limit = Number(params.limit);
      params.offset = Number(params.page) * params.limit;
    }
    delete params.page;
    return substituteVariables(query, params);
  } else {
    return query;
  }
};