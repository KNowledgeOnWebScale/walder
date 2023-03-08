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

  constructor(logger, graphQLLDHandler, templateLoader, sparqlHandler) {
    super();
    this.graphQLLDHandler = graphQLLDHandler;
    this.sparqlHandler = sparqlHandler;
    this.responseHandler = new ResponseHandler();
    this.contentNegotiationHandler = new ContentNegotiationHandler(templateLoader, {logger});
    this.postprocessHandler =  new PostprocessHandler();
    this.logger = logger;
    this.templateLoader = templateLoader;
  }

  /**
   * Returns a function that executes the query and postprocessing. Used as the express route callback function.
   *
   * @param queryInfo, Object containing all information required for GraphQL-LD or SPARQL query execution
   * @param pipeFunctions, [{ function: pipeFunction, parameters: parameters }] List of objects with a postprocessing function and its parameters.
   * @param htmlInfo, { statusCode: HTMLInfo } object (see walder/lib/models/htmlInfo.js)
   *
   * @returns {Function}, Express route callback
   */
  handle(queryInfo, pipeFunctions, htmlInfo, status) {
    const converter = new HTMLConverter({logger: this.logger, templateLoader: this.templateLoader});

    return async (req, res, next) => {
      if (status !== 404) {
        if (queryInfo && Object.keys(queryInfo).length > 0) {
          if (queryInfo.type === `graphql-ld`) {
            this.queryWithGraphQLLD({queryInfo, req, res, pipeFunctions, htmlInfo, converter});
          } else {
            this.queryWithSPARQL({queryInfo, req, res, pipeFunctions, htmlInfo, converter});
          }
        } else {
          // No GraphQL or SPARQL query is defined, so we just use the template without data.
          try {
            status = 200;
            const html = await converter.convert(htmlInfo[String(status)], {});
            this.responseHandler.handle(res, status, 'text/html')(html);
          } catch (err) {
            this.logger.error(`HTML conversion failed for "${req.path}": `);

            if (err.message) {
              this.logger.error(`${err.message}`);
            }

            status = 500;
            const html = await converter.convert(htmlInfo[String(status)], {});
            this.responseHandler.handle(res, status, 'text/html')(html);
          }
        }
      } else {
        const html = await converter.convert(htmlInfo[String(status)], {});
        this.responseHandler.handle(res, status, 'text/html')(html);
      }
    }
  };

  queryWithGraphQLLD(options) {
    const {queryInfo, req, res, pipeFunctions, htmlInfo, converter} = options;

    this.graphQLLDHandler.handle(queryInfo, req.params, req.query)
      .then(async (data) => {
        // Postprocessing: Apply pipe modules to query result
        try {
          const pipeResult = await this.postprocessHandler.handle(data, pipeFunctions);
          this.contentNegotiationHandler.handle(pipeResult, htmlInfo, queryInfo, req, res);
        } catch (e) {
          // If something goes wrong with applying the pipe modules, send status code 500
          console.error('Pipe module error: ' + e.message);
          const html = await converter.convert(htmlInfo['500'], {});
          this.responseHandler.handle(res, 500, 'text/html')(html);
        }
      })
      .catch(async (e) => {
        this.logger.error('GraphQL-LD error: ' + e.message);

        // Check what kind of error was thrown and respond appropriately
        let status = 500;

        if (e.type === 'GRAPHQL-MISSINGREQUIREDPARAMETERS' ||
          e.type === 'GRAPHQL-INTEGER-BELOW-MINIMUM' ||
          e.type === 'GRAPHQL-INTEGER-ABOVE-MAXIMUM') {
          status = 400;
        } else if (e.message.includes('Variable')) {
          status = 404;
        }

        const handleResponse = this.responseHandler.handle(res, status, 'text/html');

        if (!htmlInfo[String(status)]) {
          this.logger.warn(`No HTML template is defined for status code ${status}. Sending an empty string instead.`);
          handleResponse('');
        } else {
          const html = await converter.convert(htmlInfo[String(status)], {});
          handleResponse(html);
        }
      })
  };

  async queryWithSPARQL(options) {
    const {queryInfo, req, res, pipeFunctions, htmlInfo, converter} = options;

    try {
      const data = await this.sparqlHandler.handle(queryInfo, req.params, req.query);
      // Postprocessing: Apply pipe modules to query result
      try {
        const pipeResult = await this.postprocessHandler.handle(data, pipeFunctions);
        this.contentNegotiationHandler.handle(pipeResult, htmlInfo, queryInfo, req, res);
      } catch (e) {
        // If something goes wrong with applying the pipe modules, send status code 500
        console.error('Pipe module error: ' + e.message);
        const html = await converter.convert(htmlInfo['500'], {});
        this.responseHandler.handle(res, 500, 'text/html')(html);
      }
    } catch (e) {
      this.logger.error('SPARQL error: ' + e.message);

      // Check what kind of error was thrown and respond appropriately
      let status = 500;

      if (e.type === 'SPARQL-MISSINGREQUIREDPARAMETERS' ||
        e.type === 'SPARQL-INTEGER-BELOW-MINIMUM' ||
        e.type === 'SPARQL-INTEGER-ABOVE-MAXIMUM') {
        status = 400;
      } else if (e.message.includes('Variable')) {
        status = 404;
      }

      const handleResponse = this.responseHandler.handle(res, status, 'text/html');

      if (!htmlInfo[String(status)]) {
        this.logger.warn(`No HTML template is defined for status code ${status}. Sending an empty string instead.`);
        handleResponse('');
      } else {
        const html = await converter.convert(htmlInfo[String(status)], {});
        handleResponse(html);
      }
    }
  }
};
