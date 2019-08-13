const assert = require('chai').should();
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const DataSourceParser = require('../../parsers/dataSourceParser');

describe('DataSourceParser', function() {

  before (function() {
    const file = fs.readFileSync(path.resolve(__dirname, '../config_test_example.yaml'), 'utf8');
    const yamlData = YAML.parse(file);
    this.dataSourceParser = new DataSourceParser(yamlData);
  });

  describe('#functionality()', function() {
    it('should be able to parse and extract datasources correctly from a YAML config file', function() {
      const output = this.dataSourceParser.parse();
      output.should.eql([{type: 'sparql', value: 'http://dbpedia.org/sparql'}])
    });
  });

  describe('#outputFormat()', function() {
    it('output should be a list of {type, value} objects', function() {
      const output = this.dataSourceParser.parse();
      output.should.be.a('Array');
      output.forEach((o) => {
        o.should.have.property('type');
        o.should.have.property('value');
      })
    });
  });

});