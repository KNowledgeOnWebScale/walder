'use strict';

/**
 * Contains all information required to execute a GrapQL-LD query.
 *
 * @type {module.GraphQLLDInfo}
 */
module.exports = class GraphQLLDInfo {
  constructor(query, context, comunicaConfig, cache) {
    this.query = query;
    this.context = context;
    this.comunicaConfig = comunicaConfig;
    this.cache = cache;
  }
};