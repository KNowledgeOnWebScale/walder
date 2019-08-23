require('chai').should();
const GraphQLLDParser = require('../../lib/parsers/graphQLLDParser');

const CONFIG_FILE = '../resources/config_test_example.yaml';


describe('GraphQLLDParser', function () {

  before(function () {
    const YAML = require('yaml');
    const fs = require('fs');
    const path = require('path');

    const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
    this.yamlData = YAML.parse(file);


    this.output = GraphQLLDParser.parse(this.yamlData.paths['/movies/{actor}']['get'].query, this.yamlData.datasources);

  });

  describe('#functionality()', function () {
    it('should be able to parse and extract GraphQL-LD information correctly from a YAML config file', function () {
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
          "query": "{ id @single ... on Film { starring(label: $actor) @single }}",
          "datasources": this.yamlData.datasources
        }
      )
    });
  });

  describe('#outputFormat()', function () {
    it('output object should have { context, query, datasources } properties', function () {
      this.output.should.have.property('context');
      this.output.should.have.property('query');
      this.output.should.have.property('datasources');
    })
  });
});