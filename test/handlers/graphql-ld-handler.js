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
    const actualNewQuery = handler._substituteVariables(query, variables, definedParameters);
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
    const actualNewQuery = handler._substituteVariables(query, variables, definedParameters);

    actualNewQuery.should.eql(expectedNewQuery);
  });
});
