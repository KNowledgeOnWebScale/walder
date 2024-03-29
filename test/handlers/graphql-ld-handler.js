require('chai').should();
const expect = require('chai').expect;
const GraphQLLDHandler = require('../../lib/handlers/graphql-ld-handler');

describe('GraphQLLDHandler', function () {

  it('integer variable in query', () => {
    const handler = new GraphQLLDHandler();
    const query = '{ id @single name @single review @single { rating(value: $value) }}';
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
    const expectedNewQuery = '{ id @single name @single review @single { rating(value: "1") }}';
    const actualNewQuery = handler._substituteVariables(query, variables, definedParameters, '$', 'GRAPHQL');
    actualNewQuery.should.eql(expectedNewQuery);
  });

  it('should be able to throw an error when an integer can\'t be parsed', () => {
    const handler = new GraphQLLDHandler();
    const query = '{ id @single name @single review @single { rating(value: $value) }}';
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

  it('string variable in query', () => {
    const handler = new GraphQLLDHandler();
    const query = '{ id @single name @single review @single { rating(value: $value) }}';
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
    const expectedNewQuery = '{ id @single name @single review @single { rating(value: "1") }}';
    const actualNewQuery = handler._substituteVariables(query, variables, definedParameters, '$', 'GRAPHQL');

    actualNewQuery.should.eql(expectedNewQuery);
  });

  it('Query data source with expired certificate', async () => {
    const handler = new GraphQLLDHandler(undefined, undefined, () => {});
    const graphQLLDInfo = {
      "queries": {
        "projects": {
          "query": "{ id(_:KNOWS) hasProject { id @single name @single description @single image @single url @single @optional }}"
        },
      },
      "context": {
        "@context": {
          "schema": "http://schema.org/",
          "image": "schema:image",
          "hasProject": "schema:memberOf",
          "name": "schema:name",
          "description": "schema:description",
          "url": "schema:url",
          "abstract": "schema:abstract",
          "articleBody": "schema:articleBody",
          "created": {
            "@reverse": "schema:creator"
          },
          "KNOWS": "https://data.knows.idlab.ugent.be/person/office/#"
        }
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
      await handler.handle(graphQLLDInfo, {}, {});
    } catch (e) {
      error = e;
    }

    expect(error).to.not.equal(undefined);
    expect(error.message).to.include('Comunica: fetch failed');
    expect(error.message).to.include('data source: https://expired.badssl.com/');
  });

  it('Query data source with self-signed certificate', async () => {
    const handler = new GraphQLLDHandler(undefined, undefined, () => {});
    const graphQLLDInfo = {
      "queries": {
        "projects": {
          "query": "{ id(_:KNOWS) hasProject { id @single name @single description @single image @single url @single @optional }}"
        },
      },
      "context": {
        "@context": {
          "schema": "http://schema.org/",
          "image": "schema:image",
          "hasProject": "schema:memberOf",
          "name": "schema:name",
          "description": "schema:description",
          "url": "schema:url",
          "abstract": "schema:abstract",
          "articleBody": "schema:articleBody",
          "created": {
            "@reverse": "schema:creator"
          },
          "KNOWS": "https://data.knows.idlab.ugent.be/person/office/#"
        }
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
      await handler.handle(graphQLLDInfo, {}, {});
    } catch (e) {
      error = e;
    }

    expect(error).to.not.equal(undefined);
    expect(error.message).to.include('Comunica: fetch failed');
    expect(error.message).to.include('data source: https://self-signed.badssl.com/');
  });

  it.skip('Query data source with revoked certificate', async () => {
    const handler = new GraphQLLDHandler(undefined, undefined, () => {});
    const graphQLLDInfo = {
      "queries": {
        "projects": {
          "query": "{ id(_:KNOWS) hasProject { id @single name @single description @single image @single url @single @optional }}"
        },
      },
      "context": {
        "@context": {
          "schema": "http://schema.org/",
          "image": "schema:image",
          "hasProject": "schema:memberOf",
          "name": "schema:name",
          "description": "schema:description",
          "url": "schema:url",
          "abstract": "schema:abstract",
          "articleBody": "schema:articleBody",
          "created": {
            "@reverse": "schema:creator"
          },
          "KNOWS": "https://data.knows.idlab.ugent.be/person/office/#"
        }
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
    expect(error.message).to.include('Code: CERT_HAS_EXPIRED');
    expect(error.message).to.include('data source: https://revoked.badssl.com/');
  });

  /**
   * TODO: This test succeeds but it keeps running afterwards.
   */
  it.skip('Query data sources that includes query', async () => {
    this.timeout(60000)
    const handler = new GraphQLLDHandler(null, './test/resources/pipe-modules');
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
