'use strict';

const parseGraphQLLD = require('./query-parser');
const parsePipeModule = require('./pipe-module-parser');
const PipeModuleLoader = require('../loaders/pipe-module-loader');
const PostprocessHandler = require('../handlers/postprocess-handler');

const defaultOptions = {
  cache: true
};

/**
 * This function parses an array of data sources.
 * @param dataSources - An array of data sources.
 * @param graphQLLDHandler - The GraphQLLDHandler to execute GraphQL-LD queries that return data sources.
 * @param pipeModulesPath - The path where pipe modules can be found.
 * @param options - The optional options of this function.
 * @param options.cache - Use Comunica cache if this parameter is true.
 * @returns {Promise<[]>}
 */
module.exports = async (dataSources, graphQLLDHandler, pipeModulesPath, options = {}) => {
  options = {...defaultOptions, ...options};
  let parsedDataSources = [];

  if (dataSources) {
    for (const el of dataSources) {
      if (typeof el === 'string' || el instanceof String) {
        parsedDataSources.push(el);
      } else {
        const graphQLLDInfo = parseGraphQLLD(el, {cache: options.cache, defaultDataSources: parsedDataSources});
        const results = await graphQLLDHandler.handle(graphQLLDInfo);
        const pipeModules = parsePipeModule(el['postprocessing'], pipeModulesPath);
        const pipeFunctions = PipeModuleLoader.load(pipeModules);
        const postprocessHandler = new PostprocessHandler();
        const pipeResult = await postprocessHandler.handle(results, pipeFunctions);

        parsedDataSources = parsedDataSources.concat(pipeResult.data.map(a => a.value));
      }
    }
  }

  return parsedDataSources;
}
