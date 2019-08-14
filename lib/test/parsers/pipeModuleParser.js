require('chai').should();

const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('PipeModuleParser', function () {
  {
    before(function () {
      const YAML = require('yaml');
      const fs = require('fs');
      const path = require('path');

      const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);

      const PipeModuleParser = require('../../parsers/pipeModuleParser');
      const pipeModuleParser = new PipeModuleParser(yamlData);
      this.output = pipeModuleParser.parse('/movies/{actor}', 'get');
    });

    describe('#functionality()', function () {
      it('should be able to parse and extract pipe modules correctly from a YAML config file', function () {
        this.output.should.eql(
          [
          {
            "name": "filterT",
            "source": "walter/lib/test/resources/filterT.js"
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