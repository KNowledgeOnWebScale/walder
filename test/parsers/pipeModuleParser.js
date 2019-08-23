require('chai').should();
const PipeModuleParser = require('../../lib/parsers/pipeModuleParser');
const Path = require('path');
const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('PipeModuleParser', function () {
  {
    before(function () {
      const YAML = require('yaml');
      const fs = require('fs');
      const path = require('path');

      const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
      this.yamlData = YAML.parse(file);

      this.output = PipeModuleParser.parse(this.yamlData.paths['/movies/{actor}']['get'].postprocessing,
        path.resolve(this.yamlData.resources.path, this.yamlData.resources['pipe-modules']));
    });

    describe('#functionality()', function () {
      it('should be able to parse and extract pipe modules correctly from a YAML config file', function () {
        this.output.should.eql(
          [
            {
              "name": "filterT",
              "source": Path.resolve(this.yamlData.resources.path, this.yamlData.resources['pipe-modules'], 'filterT.js')
            }]
        )
      });
    });

    describe('#outputFormat()', function () {
      it('output should be a list of objects with {name, source} properties', function () {
        this.output.forEach((o) => {
          o.should.have.property('name');
          o.should.have.property('source');
        })
      })
    });

  }
});