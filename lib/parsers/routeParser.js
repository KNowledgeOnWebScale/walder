'use strict';

const Parser = require('./parser');
const RouteInfo = require('../models/routeInfo');

/**
 * Parses the routing information and returns it as a RouteInfo object.
 *
 * @type {module.RouteParser}
 */
module.exports = class RouteParser extends Parser {
  constructor() {
    super();
  }

  static parse(path, method) {
    // Check for route parameters
    if (path.includes('{')) {
      path = path.replace('{', ':').replace('}', '');
    }

    // Remove escape characters
    if (path.includes('\\')) {
      path = path.replace('\\', '');
    }

    return new RouteInfo(method, path);
  }
};