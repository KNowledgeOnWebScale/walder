'use strict';

const Handler = require('./handler');
const GraphQLLDHandler = require('./graphQLLDHandler');
const ResponseHandler = require('./responseHandler');
const ContentNegotiationHandler = require('./contentNegotiationHandler');
const HTMLConverter = require('../converters/htmlConverter');

const UTILS = require('../utils');
const isEmpty = require('is-empty');

/**
 * Handles requests.
 *
 * @type {module.RequestHandler}
 */
module.exports = class RequestHandler extends Handler {
  constructor() {
    super();
  }

  /**
   * Returns a function that executes the query and postprocessing. Used as the express route callback function.
   *
   * @param graphQLLDInfo, Object containing all information required for GraphQL-LD query execution
   * @param pipeFunctions, List of postprocessing functions.
   * @param htmlInfo, { statusCode: HTMLInfo } object (see walter/lib/models/htmlInfo.js)
   *
   * @returns {Function}, Express route callback
   */
  static handle(graphQLLDInfo, pipeFunctions, htmlInfo, status) {
    return (req, res, next) => {
      if (! isEmpty(graphQLLDInfo)) {
        GraphQLLDHandler.handle(graphQLLDInfo, req.params, req.query)
          .then((data) => {
            // Postprocessing: Apply pipe modules to query result
            try {
              const pipeResult = UTILS.pipe(pipeFunctions)(data);

              ContentNegotiationHandler.handle(pipeResult.data, htmlInfo, graphQLLDInfo, req, res);
            }
            catch (e) {
              // If something goes wrong with applying the pipe modules, send status code 500
              console.error('Pipe module error: ' + e.message);
              HTMLConverter.convert(htmlInfo['500'], {}, ResponseHandler.handle(res, 500, 'text/html'));
            }
          })
          .catch((e) => {
            console.error('GraphQL-LD error: ' + e.message);

            // Check what kind of error was thrown and respond appropriately
            let status = 500;
            if (e.message.includes('Variable')) {
              status = 404;
            }

            HTMLConverter.convert(htmlInfo[String(status)], {}, ResponseHandler.handle(res, status, 'text/html'));
          })
      } else {
        HTMLConverter.convert(htmlInfo[String(status)], {}, ResponseHandler.handle(res, 404, 'text/html'));
      }
    }
  };
};