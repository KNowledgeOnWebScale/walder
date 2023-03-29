'use strict';

const Handler = require('./handler');

const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const {LoggerPretty} = require("@comunica/logger-pretty");
const JP = require('jsonpath');
const axios = require('axios');
const parseDataSources = require('../parsers/data-sources-parser');
const jsonld = require('jsonld');
const {RdfConverter, RDF_TYPES} = require("../converters/rdf-converter");

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
    const newQueries = this.fillInParameters(queryInfo, pathParams, queryParams,'?', 'SPARQL');

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
        config.log = new LoggerPretty({ level: this.logger?.level });
        if (queryInfo.jsonldFrame) {
          // const result = await engineConfig.queryEngine.query(newQueries[key].query,
          //   config);
          const quadStream = await engineConfig.queryEngine.queryQuads(newQueries[key].query,
            config);
          if (this.logger) {
            this.logger.debug('SPARQL: result done.');
          }
          results[key] = (await quadStream.toArray());
          if (!queryInfo.resultQuads) {
            queryInfo.resultQuads = {};
          }
          queryInfo.resultQuads[key] = results[key];
          const converter = new RdfConverter();
          results[key] = await converter.convert(RDF_TYPES.JSON_LD, results[key], queryInfo);
          // const { data } = await engineConfig.queryEngine.resultToString(result,
          //   'application/ld+json');
          // results[key] = JSON.parse(await this.streamToString(data));
          if (this.logger) {
            this.logger.debug('SPARQL: result to JSON-LD done.');
          }
          const framed = await jsonld.frame(results[key], JSON.parse(queryInfo.jsonldFrame));
          if (this.logger) {
            this.logger.debug('SPARQL: framing JSON-LD done.');
          }
          results[key] = framed;
        } else {
          if (this.logger) {
            this.logger.debug('SPARQL: no JSON-LD frame defined.');
          }
          const quadStream = await engineConfig.queryEngine.queryQuads(newQueries[key].query,
             config);
          if (this.logger) {
            this.logger.debug('SPARQL: converting quad stream to array.');
          }
          results[key] = (await quadStream.toArray());
        }
      } catch (error) {
        if (this.logger) {
          this.logger.debug(error);
        }

        const e = new Error(`Error during execution of SPARQL query "${newQueries[key].query}".`);
        e.comunicaMessage = error.message;
        throw e;
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

  encodeIntegerAsParameterValue(val) {
    return val;
  }
};
