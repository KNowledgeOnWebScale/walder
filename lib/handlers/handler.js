'use strict';

/**
 * Handler interface.
 *
 * handlers are used for a specific task in the server workflow.
 *
 * @type {module.Handler}
 */
module.exports = class Handler {
  constructor(logger, getGraphQLLDHandler, getSPARQLHandler, pipeModulesPath) {
    // Comunica query engines cache
    // Saved by stringified list of sorted data sources
    this.comunicaEngineSourcesMap = {};
    this.logger = logger;
    this.getGraphQLLDHandler = getGraphQLLDHandler;
    this.getSPARQLHandler = getSPARQLHandler;
    this.pipeModulesPath = pipeModulesPath;
  }

  handle() {
  }

  /**
   * This function fills in all path and query parameters in the GraphQL-LD and SPARQL queries.
   * @param queryInfo - The query info object.
   * @param pathParams - The path parameters.
   * @param queryParams - The query parameters.
   * @param prefix - The prefix that is used for substituting variables in the query with the parameter values.
   * @param errorPrefix - The text that is added in front of error messages.
   * @returns {{}} - The updates queries.
   */
  fillInParameters(queryInfo, pathParams, queryParams, prefix, errorPrefix) {
    return Object.keys(queryInfo.queries).reduce((acc, val) => {
      const missingRequiredParameter = this._areRequiredParametersMissing(queryInfo.parameters, pathParams, queryParams);

      if (missingRequiredParameter) {
        const err = new Error(`Not all required parameters have a value: ${missingRequiredParameter.name} (${missingRequiredParameter.in} parameter).`);
        err.type = errorPrefix + '-MISSINGREQUIREDPARAMETERS';

        throw err;
      }

      const pathParamsFromQueryInfo = {};
      const queryParamsFromQueryInfo = {};

      for (const key in queryInfo.parameters) {
        const value = queryInfo.parameters[key];

        if (value.in === 'path') {
          pathParamsFromQueryInfo[key] = value;
        } else {
          queryParamsFromQueryInfo[key] = value;
        }
      }

      const query = queryInfo.queries[val].query;
      acc[val] = {};
      acc[val].query = this._substituteQueryParams(this._substituteVariables(query, pathParams, pathParamsFromQueryInfo, prefix, errorPrefix), queryParams, queryParamsFromQueryInfo, prefix, errorPrefix);
      acc[val].options = queryInfo.queries[val].options;
      return acc;
    }, {});
  }

  /**
   * Instantiates the given query parameters in the query.
   * Pagination parameters are converted to SPARQL format.
   *
   * @param query {string} - SPARQL query
   * @param params
   * @param definedParameters
   *
   * @returns string (newQuery)
   */
  _substituteQueryParams(query, params, definedParameters, prefix, errorPrefix) {
    const keys = params && Object.keys(params);
    if (keys && keys.length > 0) {
      // Pagination parameters to SPARQL format
      // TODO
      if (keys.includes('page') && keys.includes('limit')) {
        params.limit = Number(params.limit);
        params.offset = Number(params.page) * params.limit;
      }
      delete params.page;
      return this._substituteVariables(query, params, definedParameters, prefix, errorPrefix);
    } else {
      return query;
    }
  };

  /**
   * Instantiates the given variables in the query.
   *
   * @param query
   * @param variables
   *
   * @returns string (newQuery)
   */
  _substituteVariables(query, variables, definedParameters, prefix, errorPrefix) {
    const keys = Object.keys(variables);

    if (keys.length > 0) {

      let newQuery = query;

      keys.forEach(key => {
        let val = variables[key];

        if (definedParameters[key].type === 'integer') {
          const intVal = parseInt(val);

          if (isNaN(intVal)) {
            const err = new Error(`Could not parse integer "${val}" for variable $${key}`);
            err.type = errorPrefix + '-INTEGERPARSEERROR';
            throw err;
          }

          if (definedParameters[key].minimum !== undefined && intVal < definedParameters[key].minimum) {
            const err = new Error(`Value "${val}" for integer variable $${key} is below minimum "${definedParameters[key].minimum}"`);
            err.type = errorPrefix + '-INTEGER-BELOW-MINIMUM';
            throw err;
          }

          if (definedParameters[key].maximum !== undefined && intVal > definedParameters[key].maximum) {
            const err = new Error(`Value "${val}" for integer variable $${key} is above maximum "${definedParameters[key].maximum}"`);
            err.type = errorPrefix + '-INTEGER-ABOVE-MAXIMUM';
            throw err;
          }

          val = this.encodeIntegerAsParameterValue(intVal);
        } else {
          val = `"${val}"`;
        }

        newQuery = newQuery.replace(prefix + key, val);
      });

      return newQuery;
    } else {
      return query;
    }
  };

  /**
   * This function return the required parameters for which no value is provided.
   * @param definedParams - The defined parameters.
   * @param actualPathParams - The actual path parameters.
   * @param actualQueryParams - The actual query parameters.
   * @returns {{[p: string]: *}|boolean} - The required parameters for which no value is provided or false.
   * @private
   */
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

  /**
   * This function returns an encoded version of an integer that can be used in a query.
   * @param val - The original integer value.
   */
  encodeIntegerAsParameterValue(val) {
  }

  async getEngineFromCache(queryInfo, parseDataSources) {
    // Sort the data sources before looking in cache
    queryInfo.comunicaConfig.sources.sort();

    if (!(queryInfo.comunicaConfig.sources.toString() in this.comunicaEngineSourcesMap)) {
      queryInfo.comunicaConfig.sources = await parseDataSources({dataSources: queryInfo.comunicaConfig.sources, graphQLLDHandler: this.getGraphQLLDHandler(), sparqlHandler: this.getSPARQLHandler(), pipeModulesPath: this.pipeModulesPath});
      this.comunicaEngineSourcesMap[queryInfo.comunicaConfig.sources.toString()] = this.getNewEngine(queryInfo);

      if (this.logger) {
        this.logger.verbose('Creating new Comunica query engine');
      }
    } else {
      if (this.logger) {
        this.logger.verbose('Reusing existing Comunica query engine');
      }
    }

    return this.comunicaEngineSourcesMap[queryInfo.comunicaConfig.sources.toString()];
  }

  getNewEngine(queryInfo) {

  }
};
