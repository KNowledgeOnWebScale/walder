require('chai').should();
const expect = require('chai').expect;

const GraphQLLDValidator = require('../../lib/validators/graphql-ld-validator');
const RouteInfo = require('../../lib/models/route-info');
const parseGraphQLLD = require('../../lib/parsers/graphql-ld-parser');
const parseParameter = require('../../lib/parsers/parameter-parser');

const YAML = require('yaml');
const fs = require('fs');
const Path = require('path');

const CONFIG_FILE = '../resources/config.yaml';

describe('GraphQLLDValidator', function () {
  {
    before(function () {
      const file = fs.readFileSync(Path.resolve(__dirname, CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);

      const path = '/movies/{actor}';
      const method = 'get';

      this.routeInfo = new RouteInfo(path, method);
      this.graphQLLDInfo = parseGraphQLLD(yamlData.paths[path][method]['x-walder-query'], {});
      this.parameters = parseParameter(yamlData.paths[path][method].parameters);
    });

    describe('# Variables', function () {
      it('Should return \'undefined\' when all GraphQL-LD variables are correctly described', async function () {
        expect(await GraphQLLDValidator.validate({routeInfo: this.routeInfo, parameters: this.parameters, graphQLLDInfo: this.graphQLLDInfo})).to.be.undefined;
      });

      it('Should return an error string when there are undescribed variables', async function () {
        const output = await GraphQLLDValidator.validate({routeInfo: this.routeInfo, parameters: {}, graphQLLDInfo: this.graphQLLDInfo});
        output.should.be.a.string;
        output.should.include('error');
      })
    })
  }
});
