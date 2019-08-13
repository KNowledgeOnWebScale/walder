'use strict';

const Parser = require('./parser');

class Route {
  constructor(method, path) {
    this.method = method;
    this.path = path;
  }
}

/**
 * Parses the routing information.
 *
 * @type {module.RouteParser}
 */
module.exports = class RouteParser extends Parser {
  constructor(data) {
    super(data);
  }

  parse(path, method) {
    // Check for route parameters
    if (path.includes('{')) {
      path = path.replace('{', ':').replace('}', '');
    }

    // todo: Check for query parameters

    return new Route(method, path);
  }
};