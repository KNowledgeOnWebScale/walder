'use strict';

const Handler = require('./handler');

/**
 * Handles responses.
 *
 * @type {module.ResponseHandler}
 */
module.exports = class ResponseHandler extends Handler {
  constructor() {
    super();
  }

  /**
   * Creates the callback function which sends out the result with the appropriate content type header.
   *
   * @param res, Express response object
   * @param contentType, requested content type
   * @returns {Function}
   */
  static handle(res, status, contentType) {
    return (data) => {
      res
        .set('Content-Type', contentType)
        .status(status)
        .send(data)
        .end();
    }
  }
};
