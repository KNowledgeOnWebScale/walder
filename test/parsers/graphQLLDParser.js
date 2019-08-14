require('chai').should();

const CONFIG_FILE = '../resources/config_test_example.yaml';


describe('GraphQLLDParser', function () {

  before(function () {
    const YAML = require('yaml');
    const fs = require('fs');
    const path = require('path');

    const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
    const yamlData = YAML.parse(file);

    const GraphQLLDParser = require('../../lib/parsers/graphQLLDParser');
    const graphQLLDParser = new GraphQLLDParser(yamlData);

    this.output = graphQLLDParser.parse('/movies/{actor}', 'get');

  });

  describe('#functionality()', function () {
    it('should be able to parse and extract route information correctly from a YAML config file', function () {
      this.output.should.eql(
        {
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
          "query": "{ id @single ... on Film { starring(label: $actor) @single }}"
        }
      )
    });
  });

  describe('#outputFormat()', function () {
    it('output object should have {context, query} properties', function () {
      this.output.should.have.property('context');
      this.output.should.have.property('query');
    })
  });
});