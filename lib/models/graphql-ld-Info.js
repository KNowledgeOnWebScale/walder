'use strict';

/**
 * Contains all information required to execute a GraphQL-LD query.
 *
 * @type {module.GraphQLLDInfo}
 */
module.exports = class GraphQLLDInfo {
  constructor(queries, context, comunicaConfig, cache, parameters = []) {
    this.queries = queries;
    this.context = context;
    this.comunicaConfig = comunicaConfig;
    this.cache = cache;
    this.parameters = parameters;
  }
};
