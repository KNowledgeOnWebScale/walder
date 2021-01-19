'use strict';

const validator = require('./validator');

// Contains all used sub validators.
const VALIDATORS = {
  GraphQLLD: require('./graphql-ld-validator'),
  HTML: require('./html-validator.js')
};

/**
 * Validates the input configuration file by using other section specific sub validators.
 * Sub validators are added by adding them to the constant VALIDATORS above.
 *
 * Keeps all found errors in the 'errors' property.
 *
 * @type {module.MainValidator}
 */
module.exports = class MainValidator extends validator {
  constructor() {
    super();

    this.errors = {};

    Object.keys(VALIDATORS).forEach((type) => {
      this.errors[type] = [];
    });

    // Latest errors
    this.prevErrors = {};
  }

  /**
   * Validate the given input.
   *
   * @param input input to be validated.
   *        Each validator tests the properties of this object, if they're defined.
   *        Below a list of all possible properties. Extend as validaters are added (to VALIDATORS)
   * @param input.routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param input.parameters object containing all described path and query parameters for a route
   * @param input.graphQLLDInfo parsed GraphQLLD information, see walder/lib/models/graphql-ld-info.js
   * @param input.htmlInfoDictionary object containing html info (see walder/lib/models/html-info.js) per response code, see walder/lib/parsers/html-parser.js
   */
  validate(input = {} ) {
    this.prevErrors = {};

    let hasError = false;

    Object.keys(this.errors).forEach((type) => {
      const errors = VALIDATORS[type].validate(input);
      if (errors) {
        hasError = true;
        this.prevErrors[type] = errors;
        this.errors[type].push(errors);
      }
    });

    return hasError;
  }

  /**
   * If errors were found, throw them.
   */
  finish() {
    let hasErrors = false;

    const output = ['Config file validation errors:\n'];

    Object.keys(this.errors).forEach((type) => {
      if (this.errors[type].length > 0) {
        output.push(` #${type}:`);

        for (const error of this.errors[type]) {
          hasErrors = true;

          output.push(`    - ${error}`);
        }
      }
    });

    if (hasErrors) {
      let err = new Error(output.join('\n'));
      err.type = 'VALIDATION_ERROR';
      throw err;
    }
  }
};
