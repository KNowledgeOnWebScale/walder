'use strict';

const RouteInfo = require('../models/route-info');

/**
 * Parses the routing information and returns it as a RouteInfo object.
 * @param path
 * @param method
 */
module.exports = (path, method) => {
  // Check for route parameters
  if (path.includes('{')) {
    path = path.replace('{', ':').replace('}', '');
  }

  // Remove escape characters
  if (path.includes('\\')) {
    path = path.replace('\\', '');
  }

  return new RouteInfo(method, path);
};
