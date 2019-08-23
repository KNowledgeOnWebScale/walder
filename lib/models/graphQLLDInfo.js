/**
 * Contains all information required to execute a GrapQL-LD query.
 *
 * @type {module.GraphQLLDInfo}
 */
module.exports = class GraphQLLDInfo {
  constructor(query, context, datasources) {
    this.query = query;
    this.context = context;
    this.datasources = datasources;
  }
};