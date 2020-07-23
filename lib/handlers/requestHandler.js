'use strict';

const Handler = require('./handler');
const GraphQLLDHandler = require('./graphQLLDHandler');
const ResponseHandler = require('./responseHandler');
const ContentNegotiationHandler = require('./contentNegotiationHandler');
const HTMLConverter = require('../converters/htmlConverter');

const UTILS = require('../utils');

/**
 * Handles requests.
 *
 * @type {module.RequestHandler}
 */
module.exports = class RequestHandler extends Handler {

  constructor(logger) {
    super();
    this.graphQLLDHandler = new GraphQLLDHandler(logger);
    this.responseHandler = new ResponseHandler();
    this.contentNegotiationHandler = new ContentNegotiationHandler();
  }

  /**
   * Returns a function that executes the query and postprocessing. Used as the express route callback function.
   *
   * @param graphQLLDInfo, Object containing all information required for GraphQL-LD query execution
   * @param pipeFunctions, [{ function: pipeFunction, parameters: parameters }] List of objects with a postprocessing function and its parameters.
   * @param htmlInfo, { statusCode: HTMLInfo } object (see walder/lib/models/htmlInfo.js)
   *
   * @returns {Function}, Express route callback
   */
  handle(graphQLLDInfo, pipeFunctions, htmlInfo, status) {
    return (req, res, next) => {
      if (status !== 404) {
        if (graphQLLDInfo && Object.keys(graphQLLDInfo).length > 0) {
          this.graphQLLDHandler.handle(graphQLLDInfo, req.params, req.query)
            .then((data) => {
              // Postprocessing: Apply pipe modules to query result
              try {
                const keys = Object.keys(data);
                const pipeResult = keys.reduce((acc, val) => {
                  acc[val] = UTILS.pipe(pipeFunctions)(data[val]).data;
                  return acc;
                }, {});
                this.contentNegotiationHandler.handle(pipeResult, htmlInfo, graphQLLDInfo, req, res);
              } catch (e) {
                // If something goes wrong with applying the pipe modules, send status code 500
                console.error('Pipe module error: ' + e.message);
                HTMLConverter.convert(htmlInfo['500'], {}, this.responseHandler.handle(res, 500, 'text/html'));
              }
            })
            .catch((e) => {
              console.error('GraphQL-LD error: ' + e.message);

              // Check what kind of error was thrown and respond appropriately
              let status = 500;
              if (e.message.includes('Variable')) {
                status = 404;
              }

              HTMLConverter.convert(htmlInfo[String(status)], {}, this.responseHandler.handle(res, status, 'text/html'));
            })
        } else {
          // No GraphQL query is defined, so we just use the template without data.
          status = 200;
          HTMLConverter.convert(htmlInfo[String(status)], {}, this.responseHandler.handle(res, status, 'text/html'));
        }
      } else {
        HTMLConverter.convert(htmlInfo[String(status)], {}, this.responseHandler.handle(res, status, 'text/html'));
      }
    }
  };
};
