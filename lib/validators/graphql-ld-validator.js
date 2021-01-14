'use strict';

const Validator = require('./validator');
const util = require('util');

const ERROR_TEMPLATE =
  `Config file validation error for route '%s' - '%s':
        * Query variable(s): %s not described in the parameters section.`;

/**
 * Validates the GraphQL-LD sections of the config file.
 *
 * @type {module.GraphQLLDInfoValidator}
 */
module.exports = class GraphQLLDInfoValidator extends Validator {
  constructor() {
    super();
  }

  /**
   * Validates GraphQL-LD info.
   *
   * @param validatorInput input to be validated.
   * @param validatorInput.routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param validatorInput.parameters object containing all described path and query parameters for a route
   * @param validatorInput.graphQLLDInfo parsed GraphQLLD information, see walder/lib/models/graphql-ld-info.js
   */
  static validate(validatorInput = {}) {
    if (validatorInput.routeInfo && validatorInput.graphQLLDInfo && validatorInput.parameters) {
      return this.validateVariables(validatorInput.routeInfo, validatorInput.graphQLLDInfo, validatorInput.parameters);
    }
  }

  /**
   * Checks if all variables used in the GraphQL-LD query are described in the parameters section.
   */
  static validateVariables(routeInfo, graphQLLDInfo, parameters) {
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
