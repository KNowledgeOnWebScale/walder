require('chai').should();
const parseGraphQLLD = require('../../lib/parsers/query-parser');

const CONFIG_FILE = '../resources/config.yaml';
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

describe('GraphQLLDParser', function () {

  before(function () {
    const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
    this.yamlData = YAML.parse(file);
    const options = {defaultDataSources: this.yamlData['x-walder-datasources'], cache: true};

    this.output = parseGraphQLLD(this.yamlData.paths['/movies/{actor}']['get']['x-walder-query'], options);
    this.sortingOptionsOutput = parseGraphQLLD(this.yamlData.paths['/music/{musician}/sorted']['get']['x-walder-query'], options);
    this.duplicateRemovalOptionsOutput = parseGraphQLLD(this.yamlData.paths['/music/{musician}/no_duplicates']['get']['x-walder-query'], options);
    this.smallerContextOutput = parseGraphQLLD(this.yamlData.paths['/movies2/{actor}']['get']['x-walder-query'], options);
    this.lenientOutput = parseGraphQLLD(this.yamlData.paths['/movies/{actor}']['get']['x-walder-query'], {...options, lenient: true});
  });

  describe('# Functionality', function () {
    it('should be able to parse and extract GraphQL-LD information correctly from a YAML config file', function () {
      this.output.should.eql(
        {
          "parameters": [],
          "cache": true,
          "comunicaConfig": {
            "sources": [
              "http://fragments.dbpedia.org/2016-04/en"
            ],
            "lenient": false
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
          "queries": {'data': {'query': "{ id @single ... on Film { starring(label: $actor) @single }}"}},
          "type": "graphql-ld",
          "jsonldFrame": undefined
        }
      )
    });

    it('should be able to parse sorting options correctly from a YAML config file', function () {
      this.sortingOptionsOutput.should.eql(
        {
          "parameters": [],
          "cache": true,
          "comunicaConfig": {
            "sources": [
              "http://fragments.dbpedia.org/2016-04/en"
            ],
            "lenient": false
          },
          "type": "graphql-ld",
          "jsonldFrame": undefined,
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
                  "object": "$[*]",
                  "selectors": [
                    {
                      "value": "label",
                      "order": "desc"
                    }
                  ]
                }
              }
            }
          }
        }
      )
    });

    it('should be able to parse duplicate removal options correctly from a YAML config file', function () {
      this.duplicateRemovalOptionsOutput.should.eql(
        {
          "parameters": [],
          "cache": true,
          "comunicaConfig": {
            "sources": [
              "http://fragments.dbpedia.org/2016-04/en"
            ],
            "lenient": false
          },
          "type": "graphql-ld",
          "jsonldFrame": undefined,
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
                "remove-duplicates": {
                  "object": "$[*]",
                  "value": "label"
                }
              }
            }
          }
        }
      )
    });

    it('should be able to convert a smaller version of a context to normal version', function () {
      this.smallerContextOutput.should.eql(
        {
          "parameters": [],
          "cache": true,
          "comunicaConfig": {
            "sources": [
              "http://fragments.dbpedia.org/2016-04/en"
            ],
            "lenient": false
          },
          "type": "graphql-ld",
          "jsonldFrame": undefined,
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

    it('should be able to set lenient to true in comunicaConfig', function () {
      this.lenientOutput.should.have.deep.own.property("comunicaConfig",
        {
          "sources": [
            "http://fragments.dbpedia.org/2016-04/en"
          ],
          "lenient": true
        }
      )
    });
  });

  describe('# Output format', function () {
    it('output object should have { cache, comunicaConfig, context, query } properties', function () {
      this.output.should.have.property('cache');
      this.output.should.have.property('comunicaConfig');
      this.output.should.have.property('context');
      this.output.should.have.property('queries');
    })
  });
});
