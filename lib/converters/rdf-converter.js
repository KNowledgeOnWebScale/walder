'use strict';

const Converter = require('./converter');
const assert = require('assert');
const N3 = require('n3');
const JsonLD = require('jsonld');

// Supported RDF types, values matching https://github.com/rdfjs/N3.js notation
const RDF_TYPES = {
  JSON_LD: 'jsonld',
  TURTLE: 'Turtle',
  NT: 'N-Triples',
  NQ: 'N-Quads'
};

/**
 * Reformat the given JSON data to a supported RDF type.
 */
class RdfConverter extends Converter {
  constructor() {
    super();
  }

  /**
   * Conversion always starts with reformatting the JSON to JSON-LD, followed by possible reformatting to other RDF types.
   *
   * @param format - one of the RDF_TYPES mentioned above
   * @param data - the JSON data to be reformatted
   * @param graphQLLD - GraphQLLD info object (see walder/lib/parsers/graphQLLDParser.js)
   */
   convert(format, data, graphQLLD) {
    assert(Object.values(RDF_TYPES).includes(format), 'Unsupported RDF format requested!');

    // Always convert to JSON-LD first
    const jsonld = this._toJSONLD(data, graphQLLD);

    if (format === RDF_TYPES.JSON_LD) {
      return jsonld;
    } else {
      return this._reformat(jsonld, format);
    }
  }

  /**
   * Converts the given JSON to JSON-LD.
   *
   * @param data - the JSON data to convert
   * @param graphQLLD - GraphQLLD info object (see walder/lib/parsers/graphQLLDParser.js)
   */
   _toJSONLD(data, graphQLLD) {
    const jsonld = {};

    // Add @context
    jsonld['@context'] = graphQLLD.context['@context'];

    // Concat arrays
    let concatData = [].concat(...Object.values(data));

    // Convert RdfJSTerms to JSON-LD
    concatData = this._convertRDFJSTermsToJSONLD(concatData);

    // Add @graph
    jsonld['@graph'] = concatData;

    return jsonld;
  }

  _convertRDFJSTermsToJSONLD(data) {
    if (data.termType) {
      if (data.termType === 'NamedNode') {
        return {'@id': data.value};
      } else {
        return data.value;
      }
    } else if (Array.isArray(data)) {
      return data.map(this._convertRDFJSTermsToJSONLD, this);
    } else {
      const result = {};
      for (const key in data) {
        if (key === 'id') {
          result['@id'] = data[key].value;
        } else {
          result[key] = this._convertRDFJSTermsToJSONLD(data[key]);
        }
      }
      return result;
    }
  }

  /**
   * Reformat JSON-LD to other RDF formats.
   *
   * @param data, the JSON-LD data to be reformatted
   * @param format, one of the RDF_TYPES mentioned above
   */
   _reformat(data, format) {
    return new Promise((resolve, reject) => {
      const writer = new N3.Writer({ format });

      JsonLD.toRDF(data, {format: 'application/n-quads'}, (err, nquads) => {
        const parser = new N3.Parser({format: 'N-Quads'});
        writer.addQuads(parser.parse(nquads));

        writer.end((error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
      });
    });
  }
}

module.exports = {
  RDF_TYPES,
  RdfConverter
};
