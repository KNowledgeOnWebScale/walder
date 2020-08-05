require('chai').should();
const parseHTML = require('../../lib/parsers/htmlParser');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('HtmlParser', function () {
  {
    before(function () {
      const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);

      this.output = parseHTML(yamlData.paths['/movies/{actor}']['get'].responses, '', '');
    });

    describe('#functionality()', function () {
      it('should be able to parse, extract and format html information correctly from a YAML config file', function () {
        this.output.should.eql(
          {
            '200': {
              "engine": "pug",
              "file": path.resolve('', 'movies.pug'),
              "description": "list of movies",
              "layoutsDir": ""
            }
          }
        )
      });
    });

    describe('#outputFormat()', function () {
      it('output object should have {statusCode: {engine, file}} properties', function () {
        this.output.should.have.property('200');
        this.output['200'].should.have.property('engine');
        this.output['200'].should.have.property('file');
      })
    });

  }
});
