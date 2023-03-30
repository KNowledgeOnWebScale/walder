require('chai').should();

const parseDataSources = require('../../lib/parsers/data-sources-parser');
const GraphQLLDHandler = require('../../lib/handlers/graphql-ld-handler');
const SPARQLHandler = require('../../lib/handlers/sparql-handler');
const createLogger = require('../../lib/create-logger');
const path = require('path');
const YAML = require('yaml');
const fs = require('fs');

describe('DataSourcesParser', function () {

  describe('# GRAPHQL-LD query', function () {
    it('should be able to execute query to get list of data sources', async function () {
      const file = fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/single-query/graphql-ld/config.yaml'), 'utf8');
      const pipeModulesPath = path.resolve(__dirname, '../resources/query-datasources/single-query/graphql-ld');
      this.yamlData = YAML.parse(file);
      let sparqlHandler;
      const graphQLLDHandler = new GraphQLLDHandler(createLogger(), pipeModulesPath, () => {return sparqlHandler});
      sparqlHandler = new SPARQLHandler(createLogger(), pipeModulesPath, graphQLLDHandler);

      const actual = await parseDataSources({dataSources: this.yamlData['x-walder-datasources'], graphQLLDHandler, sparqlHandler, pipeModulesPath});
      const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/single-query/graphql-ld/expected-output.json')));
      actual.should.eql(expected);
    });

    it('should be able to use additional data sources', async function () {
      const file = fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/additional-datasources/graphql-ld/config.yaml'), 'utf8');
      const pipeModulesPath = path.resolve(__dirname, '../resources/query-datasources/additional-datasources/graphql-ld');
      this.yamlData = YAML.parse(file);
      let sparqlHandler;
      const graphQLLDHandler = new GraphQLLDHandler(createLogger(), pipeModulesPath, () => {return sparqlHandler});
      sparqlHandler = new SPARQLHandler(createLogger(), pipeModulesPath, graphQLLDHandler);

      const actual = await parseDataSources({dataSources:this.yamlData['x-walder-datasources'], graphQLLDHandler, sparqlHandler, pipeModulesPath});
      const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/additional-datasources/graphql-ld/expected-output.json')));
      actual.should.eql(expected);
    });
  });

  describe('# SPARQL query', function () {
    it('should be able to execute query to get list of data sources', async function () {
      const file = fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/single-query/sparql/config.yaml'), 'utf8');
      const pipeModulesPath = path.resolve(__dirname, '../resources/query-datasources/single-query/sparql/');
      this.yamlData = YAML.parse(file);
      let sparqlHandler;
      const graphQLLDHandler = new GraphQLLDHandler(createLogger(), pipeModulesPath, () => {return sparqlHandler});
      sparqlHandler = new SPARQLHandler(createLogger(), pipeModulesPath, graphQLLDHandler);

      const actual = await parseDataSources({dataSources: this.yamlData['x-walder-datasources'], graphQLLDHandler, sparqlHandler, pipeModulesPath});
      const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/single-query/sparql/expected-output.json')));
      actual.should.eql(expected);
    });

    it('should be able to use additional data sources', async function () {
      const file = fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/additional-datasources/sparql/config.yaml'), 'utf8');
      const pipeModulesPath = path.resolve(__dirname, '../resources/query-datasources/additional-datasources/sparql');
      this.yamlData = YAML.parse(file);
      let sparqlHandler;
      const graphQLLDHandler = new GraphQLLDHandler(createLogger(), pipeModulesPath, () => {return sparqlHandler});
      sparqlHandler = new SPARQLHandler(createLogger(), pipeModulesPath, graphQLLDHandler);

      const actual = await parseDataSources({dataSources:this.yamlData['x-walder-datasources'], graphQLLDHandler, sparqlHandler, pipeModulesPath});
      const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/additional-datasources/sparql/expected-output.json')));
      actual.should.eql(expected);
    });
  });
});
