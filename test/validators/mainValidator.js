require('chai').should();
const expect = require('chai').expect;

const MainValidator = require('../../lib/validators/main-validator');
const RouteInfo = require('../../lib/models/route-info');
const parseGraphQLLD = require('../../lib/parsers/graphql-ld-parser');
const parseParameter = require('../../lib/parsers/parameter-parser');

const YAML = require('yaml');
const fs = require('fs');
const Path = require('path');

const CONFIG_FILE = '../resources/config.yaml';

describe('MainValidator', function () {
  {
    describe('# Functionality', function () {
      function validateConfig (valid) {
        const file = fs.readFileSync(Path.resolve(__dirname, CONFIG_FILE), 'utf8');
        const yamlData = YAML.parse(file);

        const path = '/movies/{actor}';
        const method = 'get';

        const mainValidator = new MainValidator();

        const routeInfo = new RouteInfo(path, method);
        const graphQLLDInfo = parseGraphQLLD(yamlData.paths[path][method]['x-walder-query'], {});
        const parameters = valid ? parseParameter(yamlData.paths[path][method].parameters) : {};

        mainValidator.validate({routeInfo, parameters, graphQLLDInfo});
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
