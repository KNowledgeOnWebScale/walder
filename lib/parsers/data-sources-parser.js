'use strict';

const parseQuery = require('./query-parser');
const parsePipeModule = require('./pipe-module-parser');
const PipeModuleLoader = require('../loaders/pipe-module-loader');
const PostprocessHandler = require('../handlers/postprocess-handler');

const defaultOptions = {
  cache: true
};

/**
 * This function parses an array of data sources.
 * @param options - The optional options of this function.
 * @param options.dataSources - An array of data sources.
 * @param options.graphQLLDHandler - The GraphQLLDHandler to execute GraphQL-LD queries that return data sources.
 * @param options.sparqlHandler - The SPARQLHandler to execute SPARQL queries that return data sources.
 * @param options.pipeModulesPath - The path where pipe modules can be found.
 * @param options.cache - Use Comunica cache if this parameter is true.
 * @returns {Promise<[]>}
 */
module.exports = async (options = {}) => {
  options = {...defaultOptions, ...options};
  const {dataSources, graphQLLDHandler, pipeModulesPath, cache, sparqlHandler} = options;
  let parsedDataSources = [];

  if (dataSources) {
    for (const el of dataSources) {
      if (typeof el === 'string' || el instanceof String) {
        parsedDataSources.push(el);
      } else {
        const queryInfo = parseQuery(el, {cache, defaultDataSources: parsedDataSources});
        let results;

        if (queryInfo.type === 'graphql-ld') {
          results = await graphQLLDHandler.handle(queryInfo);
        } else {
          results = await sparqlHandler.handle(queryInfo);
        }

        const pipeModules = parsePipeModule(el['postprocessing'], pipeModulesPath);
        const pipeFunctions = PipeModuleLoader.load(pipeModules);
        const postprocessHandler = new PostprocessHandler();
        const pipeResult = await postprocessHandler.handle(results, pipeFunctions);

        if (queryInfo.type === 'graphql-ld') {
          parsedDataSources = parsedDataSources.concat(pipeResult.data.map(a => a.value));
        } else {
          parsedDataSources = parsedDataSources.concat(pipeResult.data);
        }
      }
    }
  }

  return parsedDataSources;
}
