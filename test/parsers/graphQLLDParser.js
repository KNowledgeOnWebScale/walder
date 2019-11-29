require('chai').should();
const GraphQLLDParser = require('../../lib/parsers/graphQLLDParser');

const CONFIG_FILE = '../resources/config_test_example.yaml';
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

describe('GraphQLLDParser', function () {

  before(function () {
    const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
    this.yamlData = YAML.parse(file);


    this.output = GraphQLLDParser.parse(this.yamlData.paths['/movies/{actor}']['get']['x-walter-query'], this.yamlData['x-walter-datasources'], true);

  });

  describe('#functionality()', function () {
    it('should be able to parse and extract GraphQL-LD information correctly from a YAML config file', function () {
      this.output.should.eql(
        {
          "cache": true,
          "comunicaConfig": {
            "sources": [
              "http://fragments.dbpedia.org/2016-04/en"
            ]
          },
          "context": {
            "@context": {
              "Film": "http://dbpedia.org/ontology/Film",
              "label": {
                "@id": "http://www.w3.org/2000/01/rdf-schema#label",
                "@language": "en"
              },
              "starring": "http://dbpedia.org/ontology/starring"
            }
          },
          "queries": { 'data': "{ id @single ... on Film { starring(label: $actor) @single }}" },
        }
      )
    });
  });

  describe('#outputFormat()', function () {
    it('output object should have { cache, comunicaConfig, context, query } properties', function () {
      this.output.should.have.property('cache');
      this.output.should.have.property('comunicaConfig');
      this.output.should.have.property('context');
      this.output.should.have.property('queries');
    })
  });
});