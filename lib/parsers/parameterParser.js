'use strict';

const Parser = require('./parser');

/**
 * Parses the (path and query) parameters information corresponding to a route.
 *
 * Returns a parameterName to { required, type, desription } mapping object.
 *
 * @type {module.ParameterParser}
 */
module.exports = class ParameterParser extends Parser {
  constructor() {
    super();
  }

  static parse(parameters) {
    if (parameters) {
      const result = {};

      for (const parameter of parameters) {
        result[parameter.name] = {
          required: parameter.required || false,
          type: parameter.schema.type,
          description: parameter.description,
          in: parameter.in
        }
      }

      return result;
    } else {
      return {};
    }
  }
};
