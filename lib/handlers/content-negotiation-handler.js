'use strict';

const Handler = require('./handler');
const ResponseHandler = require('./response-handler');

const accepts = require('accepts');
const util = require('util');

// Get required data converters
const HtmlConverter = require('../converters/html-converter');
const {Converter: SPARQLJSONConverter} = require("sparqljson-to-tree");
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

// noinspection JSUnreachableSwitchBranches
/**
 * Handles content negotiation.
 *
 * @type {module.ContentNegotiationHandler}
 */
module.exports = class ContentNegotiationHandler extends Handler {
  constructor(templateLoader, options = {logger: null}) {
    super();
    this.responseHandler = new ResponseHandler();
    this.logger = options.logger;
    this.templateLoader = templateLoader;
    this.rdfConverter = new RdfConverter();
  }

  /**
   * Checks which data format the user requested, and sends a result appropriately.
   *
   * @param data, response data
   * @param htmlInfo, {statusCode: HTMLInfo} object (see walder/lib/models/htmlInfo.js)
   * @param queryInfo, Query info object
   * @param req, express 'request' object
   * @param res, express 'response' object
   */
  async handle(data, htmlInfo, queryInfo, req, res) {
    const accept = accepts(req);
    const callback = this.responseHandler.handle(res, 200, accept.type(CN_TYPES));

    try {
      switch (accept.type(CN_TYPES)) {
        case 'text/html':
          const converter = new HtmlConverter({logger: this.logger, templateLoader: this.templateLoader});
          let materializedData = data;
          let jsonld = data; // If the query was a SPARQL query, the data is already JSON-LD.

          if (materializedData && queryInfo.type === 'graphql-ld') {
            jsonld = await this.rdfConverter.convert(RDF_TYPES.JSON_LD, materializedData, queryInfo);
            materializedData = SPARQLJSONConverter.materializeTree(materializedData);
          }

          const html = await converter.convert(htmlInfo['200'], materializedData, jsonld);
          callback(html);
          break;
        case 'application/ld+json':
          if (queryInfo.type === 'sparql' && queryInfo.jsonldFrame) {
            data = queryInfo.resultQuads;
          }

          data = [].concat(...Object.values(data));

          callback(await this.rdfConverter.convert(RDF_TYPES.JSON_LD, data, queryInfo));
          break;
        case 'text/turtle':
          if (queryInfo.type === 'sparql' && queryInfo.jsonldFrame) {
            data = queryInfo.resultQuads;
          }

          data = [].concat(...Object.values(data));
          callback(await this.rdfConverter.convert(RDF_TYPES.TURTLE, data, queryInfo));
          break;
        case 'application/n-triples':
          if (queryInfo.type === 'sparql' && queryInfo.jsonldFrame) {
            data = queryInfo.resultQuads;
          }

          data = [].concat(...Object.values(data));
          callback(await this.rdfConverter.convert(RDF_TYPES.NT, data, queryInfo));
          break;
        case 'application/n-quads':
          if (queryInfo.type === 'sparql' && queryInfo.jsonldFrame) {
            data = queryInfo.resultQuads;
          }

          data = [].concat(...Object.values(data));
          callback(await this.rdfConverter.convert(RDF_TYPES.NQ, data, queryInfo));
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
      this.logger.error('Content negotiation (reformatting) error: ' + error.message);
      const converter = new HtmlConverter({logger: this.logger, templateLoader: this.templateLoader});
      const html = await converter.convert(htmlInfo['500'], {});
      this.responseHandler.handle(res, 500, 'text/html')(html);
    }
  };
};
