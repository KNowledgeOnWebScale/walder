'use strict';

const Handler = require('./handler');
const ResponseHandler = require('./response-handler');

const accepts = require('accepts');
const util = require('util');

// Get required data converters
const HtmlConverter = require('../converters/html-converter');
const RdfConverter = require('../converters/rdf-converter').RdfConverter;
const RDF_TYPES = require('../converters/rdf-converter').RDF_TYPES;

// Available content-types
//   the order of this list is significant; should be server preferred order
const CN_TYPES = [
  'text/html',
  'application/ld+json',
  'text/turtle',
  'application/n-triples',
  'application/n-quads',
  'application/json'
];

/**
 * Handles content negotiation.
 *
 * @type {module.ContentNegotiationHandler}
 */
module.exports = class ContentNegotiationHandler extends Handler {
  constructor() {
    super();
    this.responseHandler = new ResponseHandler();
  }

  /**
   * Checks which data format the user requested, and sends a result appropriately.
   *
   * @param data, response data
   * @param htmlInfo, {statusCode: HTMLInfo} object (see walder/lib/models/htmlInfo.js)
   * @param graphQLLD, GraphQLLD info object (see walder/lib/parsers/graphQLLDParser.js)
   * @param req, express 'request' object
   * @param res, express 'response' object
   */
  async handle(data, htmlInfo, graphQLLD, req, res) {
    const accept = accepts(req);
    const callback = this.responseHandler.handle(res, 200, accept.type(CN_TYPES));

    try {
      switch (accept.type(CN_TYPES)) {
        case 'text/html':
          const html = await HtmlConverter.convert(htmlInfo['200'], data);
          callback(html);
          break;
        case 'application/ld+json':
          callback(await RdfConverter.convert(RDF_TYPES.JSON_LD, data, graphQLLD));
          break;
        case 'text/turtle':
          callback(await RdfConverter.convert(RDF_TYPES.TURTLE, data, graphQLLD));
          break;
        case 'application/n-triples':
          callback(await RdfConverter.convert(RDF_TYPES.NT, data, graphQLLD, callback));
          break;
        case 'application/n-quads':
          callback(await RdfConverter.convert(RDF_TYPES.NQ, data, graphQLLD, callback));
          break;
        case 'application/json':  // for dev reasons
          res
            .set('Content-Type', 'application/json')
            .send(data);
          break;
        default:
          // Requested media type is invalid --> send 415 and error message
          this.responseHandler.handle(res, 415, 'application/json')({
            status: 415,
            message: util.format('Requested invalid media type(s): %s', req.headers.accept)
          });
          break
      }
    }
    catch (error) {
      // If something goes wrong with the data reformatting, send html with error code 500
      console.error('Content negotiation (reformatting) error: ' + error.message);
      const html = await HtmlConverter.convert(htmlInfo['500'], {});
      this.responseHandler.handle(res, 500, 'text/html')(html);
    }
  };
};
