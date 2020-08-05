require('chai').should();
const expect = require('chai').expect;

const GraphQLLDValidator = require('../../lib/validators/graphQLLDValidator');
const RouteInfo = require('../../lib/models/routeInfo');
const parseGraphQLLD = require('../../lib/parsers/graphQLLDParser');
const parseParameter = require('../../lib/parsers/parameterParser');

const YAML = require('yaml');
const fs = require('fs');
const Path = require('path');

const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('GraphQLValidator', function () {
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

    describe('#Variables', function () {
      it('Should return \'undefined\' when all GraphQL-LD variables are correctly described', function () {
        expect(GraphQLLDValidator.validate(this.routeInfo, this.graphQLLDInfo, this.parameters)).to.be.undefined;
      });

      it('Should return an error string when there are undescribed variables', function () {
        const output = GraphQLLDValidator.validate(this.routeInfo, this.graphQLLDInfo, {});
        output.should.be.a.string;
        output.should.include('error');
      })
    })
  }
});
