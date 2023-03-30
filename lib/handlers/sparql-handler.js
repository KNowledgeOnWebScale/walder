'use strict';

const Handler = require('./handler');

const {LoggerPretty} = require("@comunica/logger-pretty");
const jsonld = require('jsonld');
const {RdfConverter, RDF_TYPES} = require("../converters/rdf-converter");
const {QueryEngine} = require("@comunica/query-sparql");
const parseDataSources = require('../parsers/data-sources-parser');

/**
 * Handles SPARQL querying.
 *
 * @type {module.SPARQLHandler}
 */
module.exports = class SPARQLHandler extends Handler {

  constructor(logger, pipeModulesPath, graphQLLDHandler) {
    super(logger, () => {return graphQLLDHandler}, () => {return this}, pipeModulesPath);

    this.logger = logger;
    this.pipeModulesPath = pipeModulesPath;
    this.graphQLLDHandler = graphQLLDHandler;
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
    const newQueries = this.fillInParameters(queryInfo, pathParams, queryParams,'?', 'SPARQL');

    const engineConfig = {};
    engineConfig.queryEngine = await this.getEngineFromCache(queryInfo, parseDataSources);

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

        const quadStream = await engineConfig.queryEngine.queryQuads(newQueries[key].query,
          config);
        if (this.logger) {
          this.logger.debug('SPARQL: result done.');
          this.logger.debug('SPARQL: converting quad stream to array.');
        }
        results[key] = (await quadStream.toArray());

        if (queryInfo.jsonldFrame) {
          if (this.logger) {
            this.logger.debug('SPARQL: JSON-LD frame defined.');
          }
          if (!queryInfo.resultQuads) {
            queryInfo.resultQuads = {};
          }
          queryInfo.resultQuads[key] = results[key];
          const converter = new RdfConverter();
          results[key] = await converter.convert(RDF_TYPES.JSON_LD, results[key], queryInfo);
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

    return results;
  }

  encodeIntegerAsParameterValue(val) {
    return val;
  }

  getNewEngine(queryInfo) {
    return new QueryEngine();
  }
};
