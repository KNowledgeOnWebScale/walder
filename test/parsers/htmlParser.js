require('chai').should();
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('HtmlParser', function () {
  {
    before(function () {
      const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);

      const HtmlParser = require('../../lib/parsers/htmlParser');
      const htmlParser = new HtmlParser(yamlData);
      this.output = htmlParser.parse('/movies/{actor}', 'get', '');
    });

    describe('#functionality()', function () {
      it('should be able to parse, extract and format html information correctly from a YAML config file', function () {
        this.output.should.eql(
          {
            "engine": "pug",
            "file": path.resolve('', 'list.pug')
          }
        )
      });
    });

    describe('#outputFormat()', function () {
      it('output object should have {engine, file} properties', function () {
        this.output.should.have.property('engine');
        this.output.should.have.property('file');
      })
    });

  }
});