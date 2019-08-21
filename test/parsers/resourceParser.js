require('chai').should();

const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('ResourceParser', function() {{
  before (function() {
    const YAML = require('yaml');
    const fs = require('fs');
    const path = require('path');

    const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
    const yamlData = YAML.parse(file);

    const ResourceParser = require('../../lib/parsers/resourceParser');
    const resourceParser = new ResourceParser(yamlData.resources, CONFIG_FILE);
    this.output = resourceParser.parse();
  });

  describe('#functionality()', function () {
    it('should be able to parse, extract and format resources information correctly from a YAML config file', function () {
      this.output.should.eql(
        {
          "path": "/movies/:actor",
          "method": "get"
        }
      )
    });

    it('should be able to handle config files without a resources section and use default values instead');

    it('should be able to handle empty resource fields and use default values instead');

    it('should create a public directory with the given path if it does not exist yet');
  });

  describe('#outputFormat()', function () {
    it('output object should have {path, views, pipeModules, public} properties', function () {
      this.output.should.have.property('path');
      this.output.should.have.property('views');
      this.output.should.have.property('pipeModules');
      this.output.should.have.property('public');
    });

    it('output object\'s values should always be absolute paths');
  });

}});