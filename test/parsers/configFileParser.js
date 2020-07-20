require('chai').should();

const ConfigFileParser = require('../../lib/parsers/configFileParser');
const path = require('path');
const CONFIG_FILE = '../resources/config_test_example.yaml';
const REFERENCE_CONFIG_FILE = '../resources/config_test_example_referencing.yaml';

describe('ConfigFileParser', function () {
    {
        before(function () {
            this.regularFile = path.resolve(__dirname, CONFIG_FILE);
            this.referenceFile = path.resolve(__dirname, REFERENCE_CONFIG_FILE);
        });

        describe('#referencing', function () {
            it('should be able to resolve the references in a config file and give an equal config file', function () {
                const regularYamlData = ConfigFileParser.parse(this.regularFile);
                const referenceYamlData = ConfigFileParser.parse(this.referenceFile);
                JSON.stringify(regularYamlData).should.eql(JSON.stringify(referenceYamlData));
            });
        });
    }
});
