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
 * Reformat the given JSON data to a supported RDF serialization.
 */
class RdfConverter extends Converter {
  constructor() {
    super();
  }

  /**
   * Conversion always starts with reformatting the JSON to JSON-LD, followed by possible reformatting to other RDF types.
   *
   * @param outputFormat - one of the RDF_TYPES mentioned above
   * @param data - the JSON data to be reformatted
   * @param queryInfo - GraphQLLD info object (see walder/lib/parsers/graphQLLDParser.js)
   */
  async convert(outputFormat, data, queryInfo, inputFormat) {
    assert(Object.values(RDF_TYPES).includes(outputFormat), 'Unsupported output RDF format requested!');

    if (inputFormat) {
      assert(Object.values(RDF_TYPES).includes(inputFormat), 'Unsupported input RDF format requested!');
    }

    if (outputFormat === inputFormat) {
      return data;
    }

    let jsonld;
    // Convert to JSON-LD first when the original query was a GRAPHQL-LD query.
    if (queryInfo.type === 'graphql-ld') {
      jsonld = this._toJSONLD(data, queryInfo);
    } else {
      const nquadStr = await this._convertQuadsToNQuadsStr(data);

      if (outputFormat === RDF_TYPES.NQ) {
        return nquadStr;
      }

      jsonld = await JsonLD.fromRDF(nquadStr, {format: 'application/n-quads'});
    }

    if (outputFormat === RDF_TYPES.JSON_LD) {
      return jsonld;
    } else {
      return this._convertJSONLDToOther(jsonld, outputFormat);
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

    // Convert RDF/JS Terms to JSON-LD
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
          if (Array.isArray(data[key])) {
            result['@id'] = data[key][0].value;
          } else {
            result['@id'] = data[key].value;
          }
        } else {
          result[key] = this._convertRDFJSTermsToJSONLD(data[key]);
        }
      }
      return result;
    }
  }

  /**
   * Reformat JSON-LD to other RDF serializations.
   *
   * @param data, the JSON-LD data to be reformatted
   * @param format, one of the RDF_TYPES mentioned above
   */
  _convertJSONLDToOther(data, format) {
    return new Promise((resolve, reject) => {
      const writer = new N3.Writer({format});

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

  /**
   * Converts an array of quads to an N-Quads string.
   * @param quads - Array of quads.
   * @returns {Promise<unknown>}
   * @private
   */
  _convertQuadsToNQuadsStr(quads) {
    return new Promise((resolve, reject) => {
      const writer = new N3.Writer({format: 'application/n-quads'});
      writer.addQuads(quads);

      writer.end((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = {
  RDF_TYPES,
  RdfConverter
};
