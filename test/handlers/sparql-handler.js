require('chai').should();
const expect = require('chai').expect;
const SPARQLHandler = require('../../lib/handlers/sparql-handler');

describe('SPARQLHandler', function () {

  it('Integer variable in query', () => {
    const handler = new SPARQLHandler();
    const query = `
      PREFIX : <http://example.com/>
      
      CONSTRUCT * WHERE {
        ?tv :name ?name;
          :review [
            :rating [
              :value ?value
            ]
          ].
      }
    `;
    const variables = {
      "value": "1"
    };
    const definedParameters = {
      "value": {
        "required": true,
        "type": "integer",
        "description": "Rating of the tv shows.",
        "in": "path"
      }
    };
    const expectedNewQuery = `
      PREFIX : <http://example.com/>
      
      CONSTRUCT * WHERE {
        ?tv :name ?name;
          :review [
            :rating [
              :value 1
            ]
          ].
      }
    `
    const actualNewQuery = handler._substituteVariables(query, variables, definedParameters, '?', 'SPARQL');
    actualNewQuery.should.eql(expectedNewQuery);
  });

  it(`Should be able to throw an error when an integer can't be parsed`, () => {
    const handler = new SPARQLHandler();
    const query = `
      PREFIX : <http://example.com/>
      
      CONSTRUCT * WHERE {
        ?tv :name ?name;
          :review [
            :rating [
              :value ?value
            ]
          ].
      }
    `;
    const variables = {
      "value": "b"
    };
    const definedParameters = {
      "value": {
        "required": true,
        "type": "integer",
        "description": "Rating of the tv shows.",
        "in": "path"
      }
    };

    expect(() => handler._substituteVariables(query, variables, definedParameters)).to.throw();
  });

  it('String variable in query', () => {
    const handler = new SPARQLHandler();
    const query = `
      PREFIX : <http://example.com/>
      
      CONSTRUCT * WHERE {
        ?tv :name ?name;
          :review [
            :rating [
              :value ?value
            ]
          ].
      }
    `;
    const variables = {
      "value": "1"
    };
    const definedParameters = {
      "value": {
        "required": true,
        "type": "string",
        "description": "Rating of the tv shows.",
        "in": "path"
      }
    };
    const expectedNewQuery = `
      PREFIX : <http://example.com/>
      
      CONSTRUCT * WHERE {
        ?tv :name ?name;
          :review [
            :rating [
              :value "1"
            ]
          ].
      }
    `;
    const actualNewQuery = handler._substituteVariables(query, variables, definedParameters, '?', 'SPARQL');

    actualNewQuery.should.eql(expectedNewQuery);
  });

  it('Query data source with expired certificate', async () => {
    const handler = new SPARQLHandler();
    const queryInfo = {
      "queries": {
        "projects": {
          query: `
            PREFIX : <http://example.com/>
            CONSTRUCT {
              ?project :name ?name;
                :description ?description;
                :image ?image;
                :url ?url.
            } WHERE {
              <https://data.knows.idlab.ugent.be/person/office/#> :hasProject ?project.
               ?project :name ?name;
                :description ?description;
                :image ?image;
                :url ?url.
            }
          `
        },
      },
      "comunicaConfig": {
        "sources": [
          "https://expired.badssl.com/",
        ]
      },
      "cache": true,
      "parameters": {}
    };

    let error;

    try {
      await handler.handle(queryInfo, {}, {});
    } catch (e) {
      error = e;
    }

    expect(error).to.not.equal(undefined);
    expect(error.message).to.include('Error during execution of SPARQL query');
    expect(error.comunicaMessage).to.include('All actors rejected their test');
    expect(error.comunicaMessage).to.include('fetch failed');
  });

  it('Query data source with self-signed certificate', async () => {
    const handler = new SPARQLHandler();
    const queryInfo = {
      "queries": {
        "projects": {
          query: `
            PREFIX : <http://example.com/>
            CONSTRUCT {
              ?project :name ?name;
                :description ?description;
                :image ?image;
                :url ?url.
            } WHERE {
              <https://data.knows.idlab.ugent.be/person/office/#> :hasProject ?project.
               ?project :name ?name;
                :description ?description;
                :image ?image;
                :url ?url.
            }
          `
        },
      },
      "comunicaConfig": {
        "sources": [
          "https://self-signed.badssl.com/",
        ]
      },
      "cache": true,
      "parameters": {}
    };

    let error;

    try {
      await handler.handle(queryInfo, {}, {});
    } catch (e) {
      error = e;
    }

    expect(error).to.not.equal(undefined);
    expect(error.message).to.include('Error during execution of SPARQL query');
    expect(error.comunicaMessage).to.include('All actors rejected their test');
    expect(error.comunicaMessage).to.include('fetch failed');
  });

  it('Query data source with revoked certificate', async () => {
    const handler = new SPARQLHandler();
    const graphQLLDInfo = {
      "queries": {
        "projects": {
          query: `
            PREFIX : <http://example.com/>
            CONSTRUCT {
              ?project :name ?name;
                :description ?description;
                :image ?image;
                :url ?url.
            } WHERE {
              <https://data.knows.idlab.ugent.be/person/office/#> :hasProject ?project.
               ?project :name ?name;
                :description ?description;
                :image ?image;
                :url ?url.
            }
          `
        },
      },
      "comunicaConfig": {
        "sources": [
          "https://revoked.badssl.com/",
        ]
      },
      "cache": true,
      "parameters": {}
    };

    let error;

    try {
      await handler.handle(graphQLLDInfo, {}, {});
    } catch (e) {
      error = e;
    }

    expect(error).to.not.equal(undefined);
    expect(error.message).to.include('Error during execution of SPARQL query');
    expect(error.comunicaMessage).to.include('All actors rejected their test');
    expect(error.comunicaMessage).to.include('fetch failed');
  });

  it('Convert query result to JSON-LD with frame', async () => {
    const handler = new SPARQLHandler();
    const queryInfo = {
      "queries": {
        "movies": {
          query: `
          PREFIX dbo: <http://dbpedia.org/ontology/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          CONSTRUCT {
            ?film a dbo:Film.
          } WHERE {
            ?film a dbo:Film;
              rdfs:label ?label;
              dbo:starring [
                a dbo:Actor;
                rdfs:label "Brad Pitt"@en
              ]
          }
          `
        },
      },
      "comunicaConfig": {
        "sources": [
          "http://fragments.dbpedia.org/2016-04/en",
        ]
      },
      "jsonldFrame": `{
        "@context": {"@vocab": "http://dbpedia.org/ontology/"},
        "@type": "Film"
      }`,
      "cache": true,
      "parameters": {}
    };

    const result = await handler.handle(queryInfo, {}, {});

    expect(result.movies['@context']['@vocab']).to.equal('http://dbpedia.org/ontology/');
    expect(result.movies['@graph'].length).to.be.greaterThan(0);
  });

  /**
   * TODO: This test still needs to be converted to SPARQL.
   */
  it.skip('Query data sources that includes query', async () => {
    this.timeout(60000)
    const handler = new SPARQLHandler(null, './test/resources/pipe-modules');
    const graphQLLDInfo = {
      "queries": {
        "employees": {
          "query": `
          {
            id @single
            employer(_:team)
            name @single
          }`
        },
      },
      "context": {
        "@context": {
          "schema": "http://schema.org/",
          "foaf": "http://xmlns.com/foaf/0.1/",
          "name": "foaf:name",
          "employer": {"@reverse": "schema:employee"},
          "knows": "https://data.knows.idlab.ugent.be/person/office/#",
          "team": "knows:team"
        }
      },
      "comunicaConfig": {
        "sources": [
          "https://data.knows.idlab.ugent.be/person/office/employees.ttl",
          {
            'graphql-query': `  {
                id @single
                employer(_:team)
              }`,
            'json-ld-context': `  {
                "schema": "http://schema.org/",
                "employer": {"@reverse": "schema:employee"},
                "knows": "https://data.knows.idlab.ugent.be/person/office/#",
                "team": "knows:team"
              }`,
            datasources: {
              sources: ['https://data.knows.idlab.ugent.be/person/office/employees.ttl']
            },
            postprocessing: {
              getIds: {
                source: 'get-ids.js'
              }
            }
          }
        ]
      },
      "cache": false,
      "parameters": {}
    };

    const result = await handler.handle(graphQLLDInfo, {}, {});
    result.employees.length.should.be.greaterThan(10);
  });
});
