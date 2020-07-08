'use strict';

/**
 * Contains all information required to execute a GrapQL-LD query.
 *
 * @type {module.GraphQLLDInfo}
 */
module.exports = class GraphQLLDInfo {
  constructor(queries, context, comunicaConfig, cache, options) {
    this.queries = queries;
    this.context = context;
    this.comunicaConfig = comunicaConfig;
    this.cache = cache;
    this.options = options;
  }
};
