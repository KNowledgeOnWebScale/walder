require('chai').should();

const parseDataSources = require('../../lib/parsers/dataSourcesParser');
const GraphQLLDHandler = require('../../lib/handlers/graphQLLDHandler');
const createLogger = require('../../lib/createLogger');
const path = require('path');
const YAML = require('yaml');
const fs = require('fs');

describe('DataSourcesParser', function () {

  describe('#query', function () {
    it('should be able to execute query to get list of data sources', async function () {
      const file = fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/single-query/config.yaml'), 'utf8');
      const pipeModulesPath = path.resolve(__dirname, '../resources/query-datasources/single-query');
      this.yamlData = YAML.parse(file);
      const graphQLLDHandler = new GraphQLLDHandler(createLogger());

      const actual = await parseDataSources(this.yamlData['x-walder-datasources'], graphQLLDHandler, pipeModulesPath);
      const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/single-query/expected-output.json')));
      actual.should.eql(expected);
    });

    it('should be able to use additional data sources', async function () {
      const file = fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/additional-datasources/config.yaml'), 'utf8');
      const pipeModulesPath = path.resolve(__dirname, '../resources/query-datasources/additional-datasources');
      this.yamlData = YAML.parse(file);
      const graphQLLDHandler = new GraphQLLDHandler(createLogger());

      const actual = await parseDataSources(this.yamlData['x-walder-datasources'], graphQLLDHandler, pipeModulesPath);
      const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/query-datasources/additional-datasources/expected-output.json')));
      actual.should.eql(expected);
    });
  });
});
