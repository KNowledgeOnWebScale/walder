const Converter = require('./converter');
const assert = require('assert');
const N3 = require('n3');
const JsonLD = require('jsonld');

// Supported RDF types, matching https://github.com/rdfjs/N3.js notation
const RDF_TYPES = {
  JSON_LD: 'jsonld',
  TURTLE: 'Turtle',
  NT: 'N-Triples',
  NQ: 'N-Quads'
};

class RdfConverter extends Converter {
  constructor() {
    super();
  }

  static convert(format, data, graphQLLD, callBack) {
    assert(Object.values(RDF_TYPES).includes(format), 'Unsupported RDF format requested!');

    // Always convert to JSON-LD first
    const jsonld = {};

    // Add @context
    jsonld['@context'] = graphQLLD.context['@context'];

    this.structureData(data);

    // Add @graph
    jsonld['@graph'] = data;

    if (format === RDF_TYPES.JSON_LD) {
      callBack(jsonld);
    } else {
      this.reformat(jsonld, format, callBack)
    }
  }

  static structureData(data) {
    if ('id' in data[0]) {
      data.forEach((o) => {
        o['@id'] = o.id;
        delete o.id;
      });
    }
  }

  static reformat(data, format, callBack) {
    console.log(format);
    const writer = new N3.Writer(format);

    JsonLD.toRDF(data, {format: 'application/n-quads'}, (err, nquads) => {
      const parser = new N3.Parser({format: 'N-Quads'});
      writer.addQuads(parser.parse(nquads));

      writer.end((error, result) => {
        callBack(result);
      })
    });
  }
};

module.exports = {
  RDF_TYPES,
  RdfConverter
};