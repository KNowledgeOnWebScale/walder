require('chai').should();

describe('PipeModuleParser', function () {
  {
    before(function () {
      const YAML = require('yaml');
      const fs = require('fs');
      const path = require('path');

      const file = fs.readFileSync(path.resolve(__dirname, '../config_test_example.yaml'), 'utf8');
      const yamlData = YAML.parse(file);

      const PipeModuleParser = require('../../parsers/pipeModuleParser');
      const pipeModuleParser = new PipeModuleParser(yamlData);
      this.output = pipeModuleParser.parse('/movies/{actor}', 'get');
    });

    describe('#functionality()', function () {
      it('should be able to parse and extract pipe modules correctly from a YAML config file', function () {
        this.output.should.eql(
          [{
            "name": "filterA",
            "source": "https://raw.githubusercontent.com/driesmarzougui/random/master/filter.js"
          },
          {
            "name": "filterT",
            "source":
              "walter/example/filterT.js"
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