'use strict';

const SubValidator = require('./sub-validator');
const util = require('util');

const ERROR_TEMPLATE =
  `Config file validation error for route '%s' - '%s':
        * Query variable(s): %s not described in the parameters section.`;

/**
 * Validates the GraphQL-LD sections of the config file.
 *
 * @type {module.GraphQLLDInfoValidator}
 */
module.exports = class GraphQLLDInfoValidator extends SubValidator {
  constructor() {
    super();
  }

  /**
   * Validates GraphQL-LD info.
   *
   * @param input input to be validated.
   * @param input.routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param input.parameters object containing all described path and query parameters for a route
   * @param input.graphQLLDInfo parsed GraphQLLD information, see walder/lib/models/graphql-ld-info.js
   *
   * @returns Promise, whose resolution is: {string} validation error description (undefined if all's well)
   */
  async validate(input = {}) {
    if (input.routeInfo && input.graphQLLDInfo && input.parameters) {
      return this.validateVariables(input.routeInfo, input.graphQLLDInfo, input.parameters);
    }
  }

  /**
   * Checks if all variables used in the GraphQL-LD query are described in the parameters section.
   *
   * @param routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param graphQLLDInfo parsed GraphQLLD information, see walder/lib/models/graphql-ld-info.js
   * @param parameters object containing all described path and query parameters for a route
   *
   * @returns Promise, whose resolution is: {string} validation error description (undefined if all's well)
   */
  async validateVariables(routeInfo, graphQLLDInfo, parameters) {
    let array = [];
    for(const object of Object.values(graphQLLDInfo.queries)){
      array.push(object.query);
    }
    const queryVariables = array.join('\n').match(/\$[a-zA-Z]+/g);
    if (queryVariables) {
      const unknownVariables = queryVariables.filter((variable) => {
        let varName = variable.slice(1);

        // Pagination variable 'offset' is mapped to 'limit'
        if (varName === 'offset') {
          varName = 'limit';
        }

        return !(varName in parameters);
      });

      if (unknownVariables.length > 0) {
        return util.format(ERROR_TEMPLATE, routeInfo.path, routeInfo.method, unknownVariables.join(', '));
      }
    }
  }
};
