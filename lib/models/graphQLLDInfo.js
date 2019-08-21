/**
 * Contains all information required to execute a GrapQL-LD query.
 *
 * @type {module.GraphQLLDInfo}
 */
module.exports = class GraphQLLDInfo {
  constructor(query, context) {
    this.query = query;
    this.context = context;
  }
};