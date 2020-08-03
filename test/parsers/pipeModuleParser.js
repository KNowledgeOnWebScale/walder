require('chai').should();
const PipeModuleParser = require('../../lib/parsers/pipeModuleParser');
const Path = require('path');
const CONFIG_FILE = '../resources/config_test_example.yaml';
const YAML = require('yaml');
const fs = require('fs');

describe('PipeModuleParser', function () {

  before(function () {
    const file = fs.readFileSync(Path.resolve(__dirname, CONFIG_FILE), 'utf8');
    this.yamlData = YAML.parse(file);

    this.output = PipeModuleParser.parse(this.yamlData.paths['/movies/{actor}']['get']['x-walder-postprocessing'],
      Path.resolve(this.yamlData['x-walder-resources'].path, this.yamlData['x-walder-resources']['pipe-modules']));
    this.output_with_param = PipeModuleParser.parse(this.yamlData.paths['/movies/{actor}/postprocessed']['get']['x-walder-postprocessing'],
        Path.resolve(this.yamlData['x-walder-resources'].path, this.yamlData['x-walder-resources']['pipe-modules']));
  });

  describe('#functionality()', function () {
    it('should be able to parse and extract pipe modules correctly from a YAML config file', function () {
      this.output.should.eql(
        [
          {
            "name": "filterT",
            "source": Path.resolve(this.yamlData['x-walder-resources'].path, this.yamlData['x-walder-resources']['pipe-modules'], 'filterT.js'),
            "parameters": []
          }]
      )
    });
    it('should be able to parse and extract pipe modules correctly from a YAML config file', function () {
      this.output_with_param.should.eql(
          [
            {
              "name": "filterT_withParameters",
              "source": Path.resolve(this.yamlData['x-walder-resources'].path, this.yamlData['x-walder-resources']['pipe-modules'], 'filterT_withParameters.js'),
              "parameters": ["_data", true]
            }]
      )
    });
  });

  describe('#outputFormat()', function () {
    it('output should be a list of objects with {name, source, parameters} properties', function () {
      this.output.forEach((o) => {
        o.should.have.property('name');
        o.should.have.property('source');
        o.should.have.property('parameters');
      })
    })
  });
});
