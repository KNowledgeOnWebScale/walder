'use strict';

const Parser = require('./Parser');
const util = require('util');

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
  constructor(method, path, data) {
    super(data);
    this.path = path;
    this.method = method;
  }

  parse() {
    // Check for route parameters
    if (this.path.includes('{')) {
      this.path = this.path.replace('{', ':').replace('}', '');
    }

    // todo: Check for query parameters

    return new Route(this.method, this.path);
  }
};