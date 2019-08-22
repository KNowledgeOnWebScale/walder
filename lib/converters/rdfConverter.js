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
   * @param format, one of the RDF_TYPES mentioned above
   * @param data, the JSON data to be reformatted
   * @param graphQLLD, GraphQLLD info object (see walter/lib/parsers/graphQLLDParser.js)
   * @param callBack, function to be executed when the conversion is done (function is given the reformatted data)
   */
  static convert(format, data, graphQLLD, callBack) {
    assert(Object.values(RDF_TYPES).includes(format), 'Unsupported RDF format requested!');

    // Always convert to JSON-LD first
    const jsonld = this.toJSONLD(data, graphQLLD);

    if (format === RDF_TYPES.JSON_LD) {
      callBack(jsonld);
    } else {
      this.reformat(jsonld, format, callBack)
    }
  }

  /**
   * Converts the given JSON to JSON-LD.
   *
   * @param data, the JSON data to convert
   * @param graphQLLD, GraphQLLD info object (see walter/lib/parsers/graphQLLDParser.js)
   */
  static toJSONLD(data, graphQLLD) {
    const jsonld = {};

    // Add @context
    jsonld['@context'] = graphQLLD.context['@context'];

    this.structureData(data);

    // Add @graph
    jsonld['@graph'] = data;

    return jsonld;
  }

  /**
   * Adds typing to the data (e.g. 'id' --> '@id').
   *
   * @param data, the JSON data to be structured
   */
  static structureData(data) {
    if ('id' in data[0]) {
      data.forEach((o) => {
        o['@id'] = o.id;
        delete o.id;
      });
    }
  }

  /**
   * Reformat JSON-LD to other RDF formats.
   *
   * @param data, the JSON-LD data to be reformatted
   * @param format, one of the RDF_TYPES mentioned above
   * @param callBack, function to be executed when the conversion is done (function is given the reformatted data)
   */
  static reformat(data, format, callBack) {
    const writer = new N3.Writer(format);

    JsonLD.toRDF(data, {format: 'application/n-quads'}, (err, nquads) => {
      const parser = new N3.Parser({format: 'N-Quads'});
      writer.addQuads(parser.parse(nquads));

      writer.end((error, result) => {
        callBack(result);
      })
    });
  }
}

module.exports = {
  RDF_TYPES,
  RdfConverter
};