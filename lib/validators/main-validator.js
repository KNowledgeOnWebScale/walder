'use strict';

const GraphQLLDInfoValidator = require('./graphql-ld-validator')
const HtmlInfoValidator = require('./html-validator.js');

/**
 * Validates the input configuration file by using other section specific sub validators.
 * Sub validators are added by adding them to the member variable subValidators.
 *
 * Keeps all found errors in the 'errors' property.
 *
 * @type {module.MainValidator}
 */
module.exports = class MainValidator {
  constructor(logger) {
    this.logger = logger;
    this.errors = {};

    // Contains all used sub validators
    this.subValidators = {
      GraphQLLD: new GraphQLLDInfoValidator(logger),
      HTML: new HtmlInfoValidator(logger)
    };

    Object.keys(this.subValidators).forEach((type) => {
      this.errors[type] = [];
    });

    // Latest errors
    this.prevErrors = {};
  }

  /**
   * Validate the given input.
   *
   * @param input input to be validated.
   *        Each sub validator tests the properties of this object, if they're defined.
   *        Below a list of all possible properties. Extend as sub validaters are added (to subValidators).
   * @param input.routeInfo info about the route being validated, see walder/lib/models/route-info.js
   * @param input.parameters object containing all described path and query parameters for a route
   * @param input.graphQLLDInfo parsed GraphQLLD information, see walder/lib/models/graphql-ld-info.js
   * @param input.htmlInfoDictionary object containing html info (see walder/lib/models/html-info.js) per response code, see walder/lib/parsers/html-parser.js
   *
   * @returns Promise, whose resolution is: boolean; true if and only if validation error(s) occurred
   */
  async validate(input = {}) {
    this.prevErrors = {};

    let hasError = false;

    for (const type of Object.keys(this.errors)) {
      const errors = await this.subValidators[type].validate(input);
      if (errors) {
        hasError = true;
        this.prevErrors[type] = errors;
        this.errors[type].push(errors);
        if (this.logger) {
          this.logger.error('%s:  %s', type, errors);
        }
      }
    }

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
      const err = new Error(output.join('\n'));
      err.type = 'VALIDATION_ERROR';
      throw err;
    }
  }
};
