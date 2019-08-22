require('chai').should();

const CONFIG_FILE = '../resources/config_test_example.yaml';

describe('DataSourceParser', function () {

  before(function () {
    const YAML = require('yaml');
    const fs = require('fs');
    const path = require('path');

    const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
    const yamlData = YAML.parse(file);

    const DataSourceParser = require('../../lib/parsers/dataSourceParser');
    this.output = new DataSourceParser(yamlData.datasources).parse();
  });

  describe('#functionality()', function() {
    it('should be able to parse and extract datasources correctly from a YAML config file', function() {
      this.output.should.eql([{type: 'hypermedia', value: 'http://fragments.dbpedia.org/2016-04/en'}])
    });
  });

  describe('#outputFormat()', function () {
    it('output should be a list of objects with {type, value} properties', function () {
      this.output.should.be.a('Array');
      this.output.forEach((o) => {
        o.should.have.property('type');
        o.should.have.property('value');
      })
    });
  });

});