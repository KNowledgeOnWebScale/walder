'use strict';

const Handler = require('./handler');

const Client = require('graphql-ld').Client;
const JP = require('jsonpath');
const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;

// Comunica query engines cache
// Saved by stringified list of sorted data sources

/**
 * Handles GraphQL-LD querying.
 *
 * @type {module.GraphQLLDHandler}
 */
module.exports = class GraphQLLDHandler extends Handler {

  constructor(logger) {
    super();

    this.logger = logger;
    this.comunicaEngineSourcesMap = {};
  }

  /**
   * Instantiates the variables in the given GraphQL-LD query using the given path variables and query parameters,
   * then executes the given GraphQL-LD query using Comunica.
   *
   * @param graphQLLDInfo - Object containing the Comunica configuration, cache setting, the GraphQL query and the JSON-LD context.
   * @param pathParams - Object containing path parameters to value mapping.
   * @param queryParams - Object containing query parameter to value mapping.
   * @returns {Promise<>} - GraphQL-LD query results.
   */
  async handle(graphQLLDInfo, pathParams = {}, queryParams = {}) {
    const newQueries = Object.keys(graphQLLDInfo.queries).reduce((acc, val) => {
      const missingRequiredParameter = this._areRequiredParametersMissing(graphQLLDInfo.parameters, pathParams, queryParams);

      if (missingRequiredParameter) {
          const err = new Error(`Not all required parameters have a value: ${missingRequiredParameter.name} (${missingRequiredParameter.in} parameter).`);
          err.type = 'GRAPHQL-MISSINGREQUIREDPARAMETERS';

          throw err;
      }

      const pathParamsFromGraphQLLDInfo = {};
      const queryParamsFromGraphQLLDInfo = {};

      for (const key in graphQLLDInfo.parameters) {
        const value = graphQLLDInfo.parameters[key];

        if (value.in === 'path') {
          pathParamsFromGraphQLLDInfo[key] = value;
        } else {
          queryParamsFromGraphQLLDInfo[key] = value;
        }
      }

      const query = graphQLLDInfo.queries[val].query;
      acc[val] = {};
      acc[val].query = this._substituteQueryParams(this._substituteVariables(query, pathParams, pathParamsFromGraphQLLDInfo), queryParams, queryParamsFromGraphQLLDInfo);
      acc[val].options = graphQLLDInfo.queries[val].options;
      return acc;
    }, {});

    const clientConfig = {
      context: graphQLLDInfo.context,
    };

    // Sort the data sources before looking in cache
    graphQLLDInfo.comunicaConfig.sources.sort();

    if (!(graphQLLDInfo.comunicaConfig.sources.toString() in this.comunicaEngineSourcesMap)) {
      this.comunicaEngineSourcesMap[graphQLLDInfo.comunicaConfig.sources.toString()] = new QueryEngineComunica(graphQLLDInfo.comunicaConfig);

      if (this.logger) {
        this.logger.verbose('Creating new Comunica query engine');
      }
    } else {
      if (this.logger) {
        this.logger.verbose('Reusing existing Comunica query engine');
      }
    }

    clientConfig.queryEngine = this.comunicaEngineSourcesMap[graphQLLDInfo.comunicaConfig.sources.toString()];

    if (!graphQLLDInfo.cache) {
      await clientConfig.queryEngine.comunicaEngine.invalidateHttpCache();
    }

    if (this.logger) {
      this.logger.verbose(JSON.stringify(newQueries));
    }

    const client = new Client(clientConfig);
    const results = {};

    for (const key of Object.keys(newQueries)) {
      try {
        results[key] = await client.query({
          query: newQueries[key].query
        });
      } catch (error) {
        if (this.logger) {
          this.logger.debug(error);
        }

        throw new Error(`Error during execution of GraphQL-LD query "${newQueries[key].query}".`);
      }

      if (this.logger) {
        this.logger.verbose(JSON.stringify(results[key]));
      }
    }


    //check if queries have options
    for (const key of Object.keys(newQueries)) {
      if (newQueries[key].options){
        //results need to be sorted
        if (newQueries[key].options.sort){
          const original = JP.query(results[key].data, newQueries[key].options.sort.object);
          const sorted = this._sortBy(original, newQueries[key].options.sort.selectors);
          let sortedData = [];
          sorted.forEach(object => {
            sortedData.push(results[key].data[original.indexOf(object)]);
          });
          results[key].data = sortedData;
        }
        //duplicates need to be filtered out of the results
        if (newQueries[key].options['remove-duplicates']){
          results[key].data =
              this._removeDuplicates(results[key].data, newQueries[key].options['remove-duplicates']);
        }
      }
    }

    return results;
  }

  /**
   * Instantiates the given variables in the query.
   *
   * @param query
   * @param variables
   *
   * @returns string (newQuery)
   */
  _substituteVariables(query, variables, definedParameters) {
    const keys = Object.keys(variables);
    if (keys.length > 0) {
      let newQuery = query;
      keys.forEach(key => {
        let val = variables[key];

        if (definedParameters[key].type === 'integer') {
          val = parseInt(val);
        } else {
          val = `"${val}"`;
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
   * @param query {string} - GraphQL-LD query
   * @param params
   * @param definedParameters
   *
   * @returns string (newQuery)
   */
  _substituteQueryParams(query, params, definedParameters) {
    const keys = params && Object.keys(params);
    if (keys && keys.length > 0) {
      // Pagination parameters to GraphQL format
      if (keys.includes('page') && keys.includes('limit')) {
        params.limit = Number(params.limit);
        params.offset = Number(params.page) * params.limit;
      }
      delete params.page;
      return this._substituteVariables(query, params, definedParameters);
    } else {
      return query;
    }
  };

  /**
   * Removes the duplicates from the data who have the same value.
   *
   * @param data the data retrieved by the query
   * @param options the options that say which duplicates need to be removed
   *
   * @returns array of data with no more duplicates
   */
  _removeDuplicates(data, options) {
    let uniqueValue = [];
    let uniqueData = [];
    let objects = JP.query(data, options.object);

    objects.forEach((object, index) => {
      let value = JP.query(object, options.value)[0];
      if (uniqueValue.indexOf(value) === -1){
        uniqueValue.push(value);
        uniqueData.push(data[index]);
      }
    });

    return uniqueData;
  }


  /**
   *Sorts the array by the chosen selectors and given order (no order given === asc).
   *
   * @param array array of data given by a certain query
   * @param selectors the selectors where the results need to be sorted by
   * @returns sorted array of data
   */
  _sortBy(array, selectors) {
    return array.concat().sort((a, b) => {
      for (let selector of selectors) {
        let reverse = selector.order ? -1 : 1;

        a = selector.value ? JP.query(a, selector.value)[0] : JP.query(a,selector)[0];
        b = selector.value ? JP.query(b, selector.value)[0] : JP.query(b,selector)[0];

        if (a.toUpperCase() > b.toUpperCase()) {
          return reverse;
        }
        if (a.toUpperCase() < b.toUpperCase()) {
          return -1 * reverse;
        }
      }
      return 0;
    });
  }

  _areRequiredParametersMissing(definedParams = {}, actualPathParams, actualQueryParams) {
    const definedParamNames = Object.keys(definedParams);

    if (definedParamNames.length === 0) {
      return false;
    }

    let i = 0;
    let definedParamName = definedParamNames[i];
    let definedParam = definedParams[definedParamName];
    let paramsToLookAt = definedParam.in === 'query' ? actualQueryParams : actualPathParams;

    while (i < definedParamNames.length &&
    (!definedParam.required || (definedParam.required && paramsToLookAt[definedParamName] !== undefined))) {
      i ++;

      if (i < definedParamNames.length) {
        definedParamName = definedParamNames[i];
        definedParam = definedParams[definedParamName];
        paramsToLookAt = definedParam.in === 'query' ? actualQueryParams : actualPathParams;
      }
    }

    if (i === definedParamNames.length) {
      return false;
    } else {
      let missingParam = {name: definedParamName};
      missingParam = {...missingParam, ...definedParam};

      return missingParam;
    }
  }
};
