require('chai').should();

const parseParameter = require('../../lib/parsers/parameter-parser');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const CONFIG_FILE = '../resources/config.yaml';

describe('ParameterParser', function () {
  {
    before(function () {
      const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);

      this.output = parseParameter(yamlData.paths['/movies/{actor}']['get'].parameters);
    });

    describe('# Functionality', function () {
      it('should be able to parse, extract and format parameter information correctly from a YAML config file', function () {
        this.output.should.eql(
          {
            actor: {
              in: 'path',
              required: true,
              type: 'string',
              maximum: undefined,
              minimum: undefined,
              description: 'The target actor'
            }
          }
        )
      });
    });

    describe('# Output format', function () {
      it('output object should have { parameter: { required, type, description }} properties', function () {
        this.output.should.have.property('actor');
        this.output['actor'].should.have.property('required');
        this.output['actor'].should.have.property('type');
        this.output['actor'].should.have.property('description');
      })
    });

  }
});
