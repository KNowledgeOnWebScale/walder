require('chai').should();
const parsePipeModule = require('../../lib/parsers/pipe-module-parser');
const Path = require('path');
const CONFIG_FILE = '../resources/config.yaml';
const YAML = require('yaml');
const fs = require('fs');

describe('PipeModuleParser', function () {

  before(function () {
    const file = fs.readFileSync(Path.resolve(__dirname, CONFIG_FILE), 'utf8');
    this.yamlData = YAML.parse(file);

    this.output = parsePipeModule(this.yamlData.paths['/movies/{actor}']['get']['x-walder-postprocessing'],
      Path.resolve(this.yamlData['x-walder-resources'].root, this.yamlData['x-walder-resources']['pipe-modules']));
    this.output_with_param = parsePipeModule(this.yamlData.paths['/movies/{actor}/postprocessed']['get']['x-walder-postprocessing'],
        Path.resolve(this.yamlData['x-walder-resources'].root, this.yamlData['x-walder-resources']['pipe-modules']));
  });

  describe('# Functionality', function () {
    it('should be able to parse and extract pipe modules correctly from a YAML config file', function () {
      this.output.should.eql(
        [
          {
            "name": "filterT",
            "source": Path.resolve(this.yamlData['x-walder-resources'].root, this.yamlData['x-walder-resources']['pipe-modules'], 'filter-t.js'),
            "parameters": [],
            queryResults: undefined
          }]
      )
    });
    it('should be able to parse and extract pipe modules correctly from a YAML config file', function () {
      this.output_with_param.should.eql(
          [
            {
              "name": "filterT_withParameters",
              "source": Path.resolve(this.yamlData['x-walder-resources'].root, this.yamlData['x-walder-resources']['pipe-modules'], 'filter-t-with-parameters.js'),
              "parameters": ["_data", true],
              queryResults: undefined
            }]
      )
    });
  });

  describe('# Output format', function () {
    it('output should be a list of objects with {name, source, parameters} properties', function () {
      this.output.forEach((o) => {
        o.should.have.property('name');
        o.should.have.property('source');
        o.should.have.property('parameters');
      })
    })
  });
});
