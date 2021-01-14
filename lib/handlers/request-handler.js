'use strict';

const Handler = require('./handler');
const ResponseHandler = require('./response-handler');
const ContentNegotiationHandler = require('./content-negotiation-handler');
const HTMLConverter = require('../converters/html-converter');
const PostprocessHandler = require('./postprocess-handler');

/**
 * Handles requests.
 *
 * @type {module.RequestHandler}
 */
module.exports = class RequestHandler extends Handler {

  constructor(logger, graphQLLDHandler) {
    super();
    this.graphQLLDHandler = graphQLLDHandler;
    this.responseHandler = new ResponseHandler();
    this.contentNegotiationHandler = new ContentNegotiationHandler(logger);
    this.postprocessHandler =  new PostprocessHandler();
    this.logger = logger;
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
    return async (req, res, next) => {
      if (status !== 404) {
        if (graphQLLDInfo && Object.keys(graphQLLDInfo).length > 0) {
          this.graphQLLDHandler.handle(graphQLLDInfo, req.params, req.query)
            .then(async (data) => {
              // Postprocessing: Apply pipe modules to query result
              try {
                const pipeResult = this.postprocessHandler.handle(data, pipeFunctions);
                this.contentNegotiationHandler.handle(pipeResult, htmlInfo, graphQLLDInfo, req, res);
              } catch (e) {
                // If something goes wrong with applying the pipe modules, send status code 500
                console.error('Pipe module error: ' + e.message);
                const html = await HTMLConverter.convert(htmlInfo['500'], {});
                this.responseHandler.handle(res, 500, 'text/html')(html);
              }
            })
            .catch(async (e) => {
              this.logger.error('GraphQL-LD error: ' + e.message);

              // Check what kind of error was thrown and respond appropriately
              let status = 500;

              if (e.type === 'GRAPHQL-MISSINGREQUIREDPARAMETERS') {
                status = 400;
              } else if (e.message.includes('Variable')) {
                status = 404;
              }

              const handleResponse = this.responseHandler.handle(res, status, 'text/html');

              if (!htmlInfo[String(status)]) {
                this.logger.warn(`No HTML template is defined for status code ${status}. Sending an empty string instead.`);
                handleResponse('');
              } else {
                const html = await HTMLConverter.convert(htmlInfo[String(status)], {});
                handleResponse(html);
              }
            })
        } else {
          // No GraphQL query is defined, so we just use the template without data.
          try {
            status = 200;
            const html = await HTMLConverter.convert(htmlInfo[String(status)], {});
            this.responseHandler.handle(res, status, 'text/html')(html);
          } catch (err) {
            this.logger.error(`HTML conversion failed for "${req.path}".`);
            status = 500;
            const html = await HTMLConverter.convert(htmlInfo[String(status)], {});
            this.responseHandler.handle(res, status, 'text/html')(html);
          }
        }
      } else {
        const html = await HTMLConverter.convert(htmlInfo[String(status)], {});
        this.responseHandler.handle(res, status, 'text/html')(html);
      }
    }
  };
};
