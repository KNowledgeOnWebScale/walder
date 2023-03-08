'use strict';

const Handler = require('./handler');

const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const {LoggerPretty} = require("@comunica/logger-pretty");
const JP = require('jsonpath');
const axios = require('axios');
const parseDataSources = require('../parsers/data-sources-parser');
const jsonld = require('jsonld');

// Comunica query engines cache
// Saved by stringified list of sorted data sources

/**
 * Handles SPARQL querying.
 *
 * @type {module.SPARQLHandler}
 */
module.exports = class SPARQLHandler extends Handler {

  constructor(logger, pipeModulesPath) {
    super();

    this.logger = logger;
    this.comunicaEngineSourcesMap = {};
    this.pipeModulesPath = pipeModulesPath;
  }

  /**
   * Instantiates the variables in the given SPARQL query using the given path variables and query parameters,
   * then executes the given SPARQL query using Comunica.
   *
   * @param queryInfo - Object containing the Comunica configuration, cache setting, and the SPARQL query.
   * @param pathParams - Object containing path parameters to value mapping.
   * @param queryParams - Object containing query parameter to value mapping.
   * @returns {Promise<>} - SPARQL query results.
   */
  async handle(queryInfo, pathParams = {}, queryParams = {}) {
    const self = this;
    const newQueries = Object.keys(queryInfo.queries).reduce((acc, val) => {
      const missingRequiredParameter = this._areRequiredParametersMissing(queryInfo.parameters, pathParams, queryParams);

      if (missingRequiredParameter) {
          const err = new Error(`Not all required parameters have a value: ${missingRequiredParameter.name} (${missingRequiredParameter.in} parameter).`);
          err.type = 'SPARQL-MISSINGREQUIREDPARAMETERS';

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
      acc[val].query = this._substituteQueryParams(this._substituteVariables(query, pathParams, pathParamsFromQueryInfo), queryParams, queryParamsFromQueryInfo);
      acc[val].options = queryInfo.queries[val].options;
      return acc;
    }, {});

    const engineConfig = {};

    // Sort the data sources before looking in cache
    queryInfo.comunicaConfig.sources.sort();

    if (!(queryInfo.comunicaConfig.sources.toString() in this.comunicaEngineSourcesMap)) {
      queryInfo.comunicaConfig.sources = await parseDataSources(queryInfo.comunicaConfig.sources, self, this.pipeModulesPath);
      this.comunicaEngineSourcesMap[queryInfo.comunicaConfig.sources.toString()] = new QueryEngine();

      if (this.logger) {
        this.logger.verbose('Creating new Comunica query engine');
      }
    } else {
      if (this.logger) {
        this.logger.verbose('Reusing existing Comunica query engine');
      }
    }

    engineConfig.queryEngine = this.comunicaEngineSourcesMap[queryInfo.comunicaConfig.sources.toString()];

    if (!queryInfo.cache) {
      await engineConfig.queryEngine.comunicaEngine.invalidateHttpCache();
    }

    if (this.logger) {
      this.logger.debug(JSON.stringify(newQueries));
    }

    const results = {};

    for (const key of Object.keys(newQueries)) {
      try {
        const config = JSON.parse(JSON.stringify(queryInfo.comunicaConfig)); // We make a deep copy because Comunica changes the config object.
        config.log = new LoggerPretty({ level: 'debug' });
        config.lenient = true;
        config.httpTimeout = 20_000;
        // const bindingsStream = await engineConfig.queryEngine.queryBindings(newQueries[key].query,
        //   config);
        // results[key] = (await bindingsStream.toArray());
        if (queryInfo.jsonldFrame) {
          const result = await engineConfig.queryEngine.query(newQueries[key].query,
            config);
          this.logger.debug('SPARQL: result done.');
          const { data } = await engineConfig.queryEngine.resultToString(result,
            'application/ld+json');
          results[key] = JSON.parse(await this.streamToString(data));
          console.log(results[key]);
          this.logger.debug('SPARQL: result to JSON-LD done.');
          const framed = await jsonld.frame(results[key], JSON.parse(queryInfo.jsonldFrame));
          //console.log(framed);
          this.logger.debug('SPARQL: framing JSON-LD done.');
          results[key] = framed;
        } else {
          this.logger.debug('SPARQL: no JSON-LD frame defined.');
          const quadStream = await engineConfig.queryEngine.queryQuads(newQueries[key].query,
             config);
          this.logger.debug('SPARQL: converting quad stream to array.');
          results[key] = (await quadStream.toArray());
        }

        console.log(results[key]);

        //const staticIDs = this._getStaticIDPathsAndValues(newQueries[key].query);
        //await this._addStaticIDsToQueryResults(staticIDs, results[key], queryInfo.context);
      } catch (error) {
        if (this.logger) {
          this.logger.debug(error);
        }

        let message = `Error during execution of SPARQL query "${newQueries[key].query}".`;

        if (error.code) {
          message += ` (Code: ${error.code}`;

          const codesToCheckForFaultyDataSource = ['DEPTH_ZERO_SELF_SIGNED_CERT', 'CERT_HAS_EXPIRED', 'ENOTFOUND'];

          if (codesToCheckForFaultyDataSource.includes(error.code)) {
            const faultyDataSource = await this._findFaultyDataSource(queryInfo.comunicaConfig.sources);

            if (faultyDataSource) {
              message += `, data source: ${faultyDataSource})`;
            } else {
              message += `, data source: unable to determine)`;
            }
          } else {
            message += ')';
          }
        }

        throw new Error(message);
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
          const original = JP.query(results[key], newQueries[key].options.sort.object);
          const sorted = this._sortBy(original, newQueries[key].options.sort.selectors);
          let sortedData = [];
          sorted.forEach(object => {
            sortedData.push(results[key][original.indexOf(object)]);
          });
          results[key] = sortedData;
        }
        //duplicates need to be filtered out of the results
        if (newQueries[key].options['remove-duplicates']){
          results[key] =
              this._removeDuplicates(results[key], newQueries[key].options['remove-duplicates']);
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
          const intVal = parseInt(val);

          if (isNaN(intVal)) {
            const err = new Error(`Could not parse integer "${val}" for variable $${key}`);
            err.type = 'SPARQL-INTEGERPARSEERROR';
            throw err;
          }

          if (definedParameters[key].minimum !== undefined && intVal < definedParameters[key].minimum) {
            const err = new Error(`Value "${val}" for integer variable $${key} is below minimum "${definedParameters[key].minimum}"`);
            err.type = 'SPARQL-INTEGER-BELOW-MINIMUM';
            throw err;
          }

          if (definedParameters[key].maximum !== undefined && intVal > definedParameters[key].maximum) {
            const err = new Error(`Value "${val}" for integer variable $${key} is above maximum "${definedParameters[key].maximum}"`);
            err.type = 'SPARQL-INTEGER-ABOVE-MAXIMUM';
            throw err;
          }

          val = `"${intVal}"`;
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
   * Pagination parameters are converted to SPARQL format.
   *
   * @param query {string} - SPARQL query
   * @param params
   * @param definedParameters
   *
   * @returns string (newQuery)
   */
  _substituteQueryParams(query, params, definedParameters) {
    const keys = params && Object.keys(params);
    if (keys && keys.length > 0) {
      // Pagination parameters to SPARQL format
      // TODO
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

  /**
   * This is naive brute-force approach to find a data source that doesn't return data.
   * @param dataSources - An array of data source links.
   * @returns {Promise<*>}
   * @private
   */
  async _findFaultyDataSource(dataSources) {
    let i = 0;
    let faultyDataSource;

    while (i < dataSources.length && !faultyDataSource) {
      try {
        await axios.get(dataSources[i]);
      } catch (e) {
        faultyDataSource = dataSources[i];
      }

      i ++;
    }

    return faultyDataSource;
  }

  streamToString (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
  }
};
