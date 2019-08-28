'use strict';

const validator = require('./validator');
const StringBuilder = require('string-builder');

// Contains all used sub validators.
const VALIDATORS = {
  GraphQLLD: require('./graphQLLDValidator')
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

    this.sb = new StringBuilder();
  }

  /**
   * Validate the current route/method.
   *
   * @param routeInfo, (see walter/lib/models/routeInfo.js)
   * @param graphQLLDInfo, (see walter/lib/models/graphQLLDInfo.js)
   * @param parameters, (see walter/lib/parsers/parameterParser.js)
   */
  validate(routeInfo, graphQLLDInfo, parameters) {
    Object.keys(this.errors).forEach((type) => {
      const errors = VALIDATORS[type].validate(routeInfo, graphQLLDInfo, parameters);
      if (errors) {
        this.errors[type].push(errors);
      }
    });
  }

  /**
   * If errors were found, throw them.
   */
  finish() {
    let hasErrors = false;

    this.sb.appendLine('Config file validation errors:\n');

    Object.keys(this.errors).forEach((type) => {
      if (this.errors[type].length > 0) {
        this.sb.appendFormat(' #{0}:\n', type);

        for (const error of this.errors[type]) {
          hasErrors = true;

          this.sb.appendFormat('    - {0}\n', error);
        }
      }
    });

    if (hasErrors) {
      throw new Error(this.sb.toString());
    }
  }
};