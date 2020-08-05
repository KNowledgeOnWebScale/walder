'use strict';

/**
 * Parses the (path and query) parameters information corresponding to a route.
 * @param parameters
 * @returns {{}} - A parameterName to { required, type, description } mapping object.
 */
module.exports = (parameters) => {
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
};
