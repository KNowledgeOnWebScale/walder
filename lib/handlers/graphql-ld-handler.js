'use strict';

const Handler = require('./handler');

const Client = require('graphql-ld').Client;
const JP = require('jsonpath');
const QueryEngineComunica = require('graphql-ld-comunica').QueryEngineComunica;
const {Converter} = require('sparqljson-to-tree');
const {parse: parseGraphQL} = require('graphql');
const ContextParser = require('jsonld-context-parser').ContextParser;
const {namedNode} = require('n3').DataFactory;
const axios = require('axios');
const parseDataSources = require('../parsers/data-sources-parser');

/**
 * Handles GraphQL-LD querying.
 *
 * @type {module.GraphQLLDHandler}
 */
module.exports = class GraphQLLDHandler extends Handler {

  constructor(logger, pipeModulesPath, getSPARQLHandler) {
    super();

    this.logger = logger;
    // Comunica query engines cache
    // Saved by stringified list of sorted data sources
    this.comunicaEngineSourcesMap = {};
    this.pipeModulesPath = pipeModulesPath;
    this.getSPARQLHandler = getSPARQLHandler;
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
    const self = this;
    const newQueries = this.fillInParameters(graphQLLDInfo, pathParams, queryParams,'$', 'GRAPHQL');

    const clientConfig = {
      context: graphQLLDInfo.context,
      sparqlJsonToTreeConverter: new Converter({materializeRdfJsTerms: false})
    };

    // Sort the data sources before looking in cache
    graphQLLDInfo.comunicaConfig.sources.sort();

    if (!(graphQLLDInfo.comunicaConfig.sources.toString() in this.comunicaEngineSourcesMap)) {
      graphQLLDInfo.comunicaConfig.sources = await parseDataSources({dataSources: graphQLLDInfo.comunicaConfig.sources, graphQLLDHandler: self,sparqlHandler: this.getSPARQLHandler(), pipeModulesPath: this.pipeModulesPath});
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
      this.logger.debug(JSON.stringify(newQueries));
    }

    const client = new Client(clientConfig);
    const results = {};

    for (const key of Object.keys(newQueries)) {
      try {
        results[key] = (await client.query({
          query: newQueries[key].query
        })).data;

        const staticIDs = this._getStaticIDPathsAndValues(newQueries[key].query);
        await this._addStaticIDsToQueryResults(staticIDs, results[key], graphQLLDInfo.context);
      } catch (error) {
        if (this.logger) {
          this.logger.debug(error);
        }

        let message = `Error during execution of GraphQL-LD query "${newQueries[key].query}".`;

        if (error.code) {
          message += ` (Code: ${error.code}`;

          const codesToCheckForFaultyDataSource = ['DEPTH_ZERO_SELF_SIGNED_CERT', 'CERT_HAS_EXPIRED', 'ENOTFOUND'];

          if (codesToCheckForFaultyDataSource.includes(error.code)) {
            const faultyDataSource = await this._findFaultyDataSource(graphQLLDInfo.comunicaConfig.sources);

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

  /**
   * This function returns all paths to "id" fields with static values.
   * @param query - The GraphQL-LD query in which to look for "id" fields.
   * @param currentPath - The current JSON path within the query.
   * @returns {*[]} - An array with objects where each object has a JSON path "path" and static value "value".
   * @private
   */
  _getStaticIDPathsAndValues(query, currentPath = '$') {
    const doc = parseGraphQL(query);
    const definition = doc.definitions[0];
    const selections = definition.selectionSet.selections;
    const result = [];

    selections.forEach(selection => {
      if (selection?.name?.value === 'id' && selection?.arguments?.length > 0) {
        const value = selection.arguments[0].value.value;
        result.push({path: currentPath, value});
      } else if (selection.selectionSet) {
        if (this.logger) {
          this.logger.info('Static IDs: Nested selection sets are ignored at the moment.');
        }
      }
    });

    return result;
  }

  /**
   * This method adds the values for static IDs to the query results.
   * @param staticIDs - The array with static ID paths and values.
   * @param results - The query results.
   * @param context - The context used with the GraphQL-LD query that produced the results.
   * @private
   */
  async _addStaticIDsToQueryResults(staticIDs, results, context) {
    const myParser = new ContextParser();
    const myContext = await myParser.parse(context);

    staticIDs.forEach(staticID => {
      let {path, value} = staticID;
      if (path === '$') {
        value = myContext.getContextRaw()[value];
        results.forEach(result => {
          result['id'] = namedNode(value)
        });
      }
    });
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

  encodeIntegerAsParameterValue(val) {
    return `"${val}"`;
  }
};
