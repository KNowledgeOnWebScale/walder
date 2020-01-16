require('chai').should();
const expect = require('chai').expect;

const MainValidator = require('../../lib/validators/mainValidator');
const RouteInfo = require('../../lib/models/routeInfo');
const GraphQLLDParser = require('../../lib/parsers/graphQLLDParser');
const ParameterParser = require('../../lib/parsers/parameterParser');

const YAML = require('yaml');
const fs = require('fs');
const Path = require('path');

const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('mainValidator', function () {
  {
    describe('#functionality', function () {
      function validateConfig (valid) {
        const file = fs.readFileSync(Path.resolve(__dirname, CONFIG_FILE), 'utf8');
        const yamlData = YAML.parse(file);

        const path = '/movies/{actor}';
        const method = 'get';

        const mainValidator = new MainValidator();

        const routeInfo = new RouteInfo(path, method);
        const graphQLLDInfo = GraphQLLDParser.parse(yamlData.paths[path][method]['x-walder-query'], {});
        const parameters = valid ? ParameterParser.parse(yamlData.paths[path][method].parameters) : {};

        mainValidator.validate(routeInfo, graphQLLDInfo, parameters);
        mainValidator.finish();
      }

      it('Should not throw an error when the given config file does not contain errors', function() {
        expect(() => validateConfig(true)).to.not.throw();
      });

      it('Should throw an error when the given config file contains errors', function () {
        expect(() => validateConfig(false)).to.throw();
      });
    })
  }
});