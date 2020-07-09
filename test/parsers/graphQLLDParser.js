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


    this.output = GraphQLLDParser.parse(this.yamlData.paths['/movies/{actor}']['get']['x-walder-query'], this.yamlData['x-walder-datasources'], true);
    this.global_options_output = GraphQLLDParser.parse(this.yamlData.paths['/music/{musician}']['get']['x-walder-query'], this.yamlData['x-walder-datasources'], true);
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
          "queries": { 'data': {'query': "{ id @single ... on Film { starring(label: $actor) @single }}"} },
        }
      )
    });

    it('should be able to parse sorting/duplicate-removal options correctly from a YAML config file', function () {
      this.global_options_output.should.eql(
          {
            "cache": true,
            "comunicaConfig": {
              "sources": [
                  "http://fragments.dbpedia.org/2016-04/en"
              ]
            },
            "context": {
              "@context": {
                "label": "http://www.w3.org/2000/01/rdf-schema#label",
                "label_en": {
                  "@id": "http://www.w3.org/2000/01/rdf-schema#label",
                  "@language": "en"
                },
                "writer": "http://dbpedia.org/ontology/writer",
                "artist": "http://dbpedia.org/ontology/musicalArtist"
              }
            },
            "queries": {
              "data": {
                  "query": "{ label @single writer(label_en: $musician) @single artist @single(scope: all) { label }}",
                  "options": {
                      "sort": {
                          "selectors": [
                              {
                                  "value": "label",
                                  "order": "desc"
                              }
                          ]
                      },
                      "remove-duplicates": {
                          "selector": "label"
                      }
                  }
              }
            }
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
