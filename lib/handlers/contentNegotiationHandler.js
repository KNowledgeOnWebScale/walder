'use strict';

const Handler = require('./handler');
const ResponseHandler = require('./responseHandler');

const accepts = require('accepts');
const util = require('util');

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

// Get required data converters
const HtmlConverter = require('../converters/htmlConverter');
const RdfConverter = require('../converters/rdfConverter').RdfConverter;
const RDF_TYPES = require('../converters/rdfConverter').RDF_TYPES;

/**
 * Handles content negotiation.
 *
 * @type {module.ContentNegotiationHandler}
 */
module.exports = class ContentNegotiationHandler extends Handler {
  /**
   * Checks which data format the user requested, and sends a result appropriately.
   *
   * @param data, response data
   * @param htmlInfo, {statusCode: HTMLInfo} object (see walter/lib/models/htmlInfo.js)
   * @param graphQLLD, GraphQLLD info object (see walter/lib/parsers/graphQLLDParser.js)
   * @param req, express 'request' object
   * @param res, express 'response' object
   */
  static handle(data, htmlInfo, graphQLLD, req, res) {
    const accept = accepts(req);
    const callback = ResponseHandler.handle(res, 200, accept.type(CN_TYPES));

    try {
      switch (accept.type(CN_TYPES)) {
        case 'text/html':
          HtmlConverter.convert(htmlInfo['200'], data, callback);
          break;
        case 'application/ld+json':
          RdfConverter.convert(RDF_TYPES.JSON_LD, data, graphQLLD, callback);
          break;
        case 'text/turtle':
          RdfConverter.convert(RDF_TYPES.TURTLE, data, graphQLLD, callback);
          break;
        case 'application/n-triples':
          RdfConverter.convert(RDF_TYPES.NT, data, graphQLLD, callback);
          break;
        case 'application/n-quads':
          RdfConverter.convert(RDF_TYPES.NQ, data, graphQLLD, callback);
          break;
        case 'application/json':  // for dev reasons
          res
            .set('Content-Type', 'application/json')
            .send(data);
          break;
        default:
          // Requested media type is invalid --> send 415 and error message
          ResponseHandler.handle(res, 415, 'application/json')({
            status: 415,
            message: util.format('Requested invalid media type(s): %s', req.headers.accept)
          });
          break
      }
    }
    catch (error) {
      // If something goes wrong with the data reformatting, send html with error code 500
      console.error('Content negotiation (reformatting) error: ' + error.message);
      HtmlConverter.convert(htmlInfo['500'], {}, ResponseHandler.handle(res, 500, 'text/html'));
    }
  };
};