'use strict';

const Parser = require('./parser');
const GraphQLLDParser = require('./graphQLLDParser');
const PipeModuleParser = require('./pipeModuleParser');
const PipeModuleLoader = require('../loaders/pipeModuleLoader');
const PostprocessHandler = require('./../handlers/postprocessHandler');

const defaultOptions = {
  cache: true
};

class DataSourcesParser extends Parser {

  constructor() {
    super();
  }

  /**
   * This function parses an array of data sources.
   * @param dataSources - An array of data sources.
   * @param graphQLLDHandler - The GraphQLLDHandler to execute GraphQL-LD queries that return data sources.
   * @param pipeModulesPath - The path where pipe modules can be found.
   * @param options - The optional options of this function.
   * @param options.cache - Use Comunica cache if this parameter is true.
   * @returns {Promise<[]>}
   */
  static async parse(dataSources, graphQLLDHandler, pipeModulesPath, options = {}) {
    options = {...defaultOptions, ...options};
    let parsedDataSources = [];

    if (dataSources) {
      for (const el of dataSources) {
        if (typeof el === 'string' || el instanceof String) {
          parsedDataSources.push(el);
        } else {
          const graphQLLDInfo = GraphQLLDParser.parse(el, {cache: options.cache, defaultDataSources: parsedDataSources});
          const results = await graphQLLDHandler.handle(graphQLLDInfo);
          const pipeModules = PipeModuleParser.parse(el['postprocessing'], pipeModulesPath);
          const pipeFunctions = PipeModuleLoader.load(pipeModules);
          const postprocessHandler =  new PostprocessHandler();
          const pipeResult = postprocessHandler.handle(results, pipeFunctions);

          parsedDataSources = parsedDataSources.concat(pipeResult.data);
        }
      }
    }

    return parsedDataSources;
  }
}

module.exports = DataSourcesParser;
