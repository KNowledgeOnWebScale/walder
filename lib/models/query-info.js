'use strict';

/**
 * Contains all information required to execute a GraphQL-LD or SPARQL query.
 *
 * @type {module.QueryInfo}
 */
module.exports = class QueryInfo {
  constructor(queries, context, comunicaConfig, cache, parameters = [], type = 'graphql-ld', jsonldFrame) {
    this.queries = queries;
    this.context = context;
    this.comunicaConfig = comunicaConfig;
    this.cache = cache;
    this.parameters = parameters;
    this.type = type;
    this.jsonldFrame = jsonldFrame;
  }
};
