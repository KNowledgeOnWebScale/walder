require('chai').should();

const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('RouteParser', function() {{
  before (function() {
    const YAML = require('yaml');
    const fs = require('fs');
    const path = require('path');

    const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
    const yamlData = YAML.parse(file);

    const RouteParser = require('../../lib/parsers/routeParser');
    const routeParser = new RouteParser(yamlData);
    this.output = routeParser.parse('/movies/{actor}', 'get');
  });

  describe('#functionality()', function () {
    it('should be able to parse, extract and format route information correctly from a YAML config file', function () {
      this.output.should.eql(
        {
          "path": "/movies/:actor",
          "method": "get"
        }
      )
    });
  });

  describe('#outputFormat()', function () {
    it('output object should have {path, method} properties', function () {
      this.output.should.have.property('path');
      this.output.should.have.property('method');
    })
  });

}});