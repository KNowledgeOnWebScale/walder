require('chai').should();
const RDF_TYPES = require('../../lib/converters/rdf-converter').RDF_TYPES;
const RdfConverter = require('../../lib/converters/rdf-converter').RdfConverter;
const ExampleData = require('../resources/example-data');
const jsonld = require('jsonld');
const N3 = require('n3');

describe('RdfConverter', function () {

  describe('# Functionality', function () {
    it('should be able to convert the given JSON to JSON-LD', async () => {
      const data = await new RdfConverter().convert(
        RDF_TYPES.JSON_LD,
        ExampleData.EX_1_RDF_CONVERTER_DATA,
        ExampleData.EX_1_RDF_CONVERTER_GRAPHQLLD);

      // If 'JsonLD' can turn it into N-Quads without errors, then it must be valid JSON-LD
      await jsonld.toRDF(data, {format: 'application/n-quads'}, (err, nquads) => {
        if (err) {
          throw new Error(err);
        }
      });
    });

    it('should be able to convert the given JSON to Turtle', async () => {
      const data = await new RdfConverter().convert(
        RDF_TYPES.TURTLE,
        ExampleData.EX_1_RDF_CONVERTER_DATA,
        ExampleData.EX_1_RDF_CONVERTER_GRAPHQLLD);

      const parser = new N3.Parser({format: 'Turtle'});
      // If 'N3' can parse it, then it must be valid turtle
      parser.parse(data).length.should.be.above(0);
    });

    it('should be able to convert the given JSON to N-Triples', async () => {
      const data = await new RdfConverter().convert(
        RDF_TYPES.NT,
        ExampleData.EX_1_RDF_CONVERTER_DATA,
        ExampleData.EX_1_RDF_CONVERTER_GRAPHQLLD);

      const parser = new N3.Parser({format: 'N-Triples'});
      // If 'N3' can parse it, then it must be valid N-triples
      parser.parse(data).length.should.be.above(0);
    });

    it('should be able to convert the given JSON to N-Quads', async () => {
      const data = await new RdfConverter().convert(
        RDF_TYPES.NQ,
        ExampleData.EX_1_RDF_CONVERTER_DATA,
        ExampleData.EX_1_RDF_CONVERTER_GRAPHQLLD);

      const parser = new N3.Parser({format: 'N-Quads'});
      // If 'N3' can parse it, then it must be valid turtle
      parser.parse(data).length.should.be.above(0);
    });

    it('should be able to convert empty JSON to N-Quads', async () => {
      const data = await new RdfConverter().convert(
        RDF_TYPES.NQ,
        ExampleData.EX_2_RDF_CONVERTER_DATA,
        ExampleData.EX_2_RDF_CONVERTER_GRAPHQLLD);

      const parser = new N3.Parser({format: 'N-Quads'});
      // If 'N3' can parse it, then it must be valid turtle
      parser.parse(data).length.should.be.equal(0);
    });
  })
});
