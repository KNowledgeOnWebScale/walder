'use strict';

/**
 * Represents express route information.
 *
 * @type {module.RouteInfo}
 */
module.exports = class RouteInfo {
  constructor(method, path) {
    this.method = method;
    this.path = path;
  }
};