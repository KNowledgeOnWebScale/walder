require('chai').should();
const RDF_TYPES = require('../../lib/converters/rdfConverter').RDF_TYPES;
const RdfConverter = require('../../lib/converters/rdfConverter').RdfConverter;
const ExampleData = require('../resources/exampleData');
const jsonld = require('jsonld');
const N3 = require('n3');

describe('RdfConverter', function () {

  before(function () {

  });

  describe('#functionality()', function () {
    it('should be able to convert the given JSON to JSON-LD', function (done) {
      RdfConverter.convert(
        RDF_TYPES.JSON_LD,
        ExampleData.EX_1_RDF_CONVERTER_DATA,
        ExampleData.EX_1_RDF_CONVERTER_GRAPHQLLD,
        async (data) => {
          // If 'JsonLD' can turn it into N-Quads without errors, then it must be valid JSON-LD
          await jsonld.toRDF(data, {format: 'application/n-quads'}, (err, nquads) => {
            if (err) {
              throw new Error(err);
            }
            done();
          });
        })
    });

    it('should be able to convert the given JSON to Turtle', function () {
      RdfConverter.convert(
        RDF_TYPES.TURTLE,
        ExampleData.EX_1_RDF_CONVERTER_DATA,
        ExampleData.EX_1_RDF_CONVERTER_GRAPHQLLD,
        (data) => {
          const parser = new N3.Parser({format: 'Turtle'});
          // If 'N3' can parse it, then it must be valid turtle
          parser.parse(data);
        })
    });

    it('should be able to convert the given JSON to N-Triples', function () {
      RdfConverter.convert(
        RDF_TYPES.NT,
        ExampleData.EX_1_RDF_CONVERTER_DATA,
        ExampleData.EX_1_RDF_CONVERTER_GRAPHQLLD,
        (data) => {
          const parser = new N3.Parser({format: 'N-Triples'});
          // If 'N3' can parse it, then it must be valid N-triples
          parser.parse(data);
        })
    });

    it('should be able to convert the given JSON to N-Quads', function () {
      RdfConverter.convert(
        RDF_TYPES.NQ,
        ExampleData.EX_1_RDF_CONVERTER_DATA,
        ExampleData.EX_1_RDF_CONVERTER_GRAPHQLLD,
        (data) => {
          const parser = new N3.Parser({format: 'N-Quads'});
          // If 'N3' can parse it, then it must be valid turtle
          parser.parse(data);
        })
    });
  })
});