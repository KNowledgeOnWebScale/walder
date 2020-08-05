require('chai').should();

const parseConfigFile = require('../../lib/parsers/configFileParser');
const path = require('path');

describe('ConfigFileParser', function () {

    describe('#referencing', function () {
        it('should be able to resolve the references in a config file and give an equal config file', async function() {
            const regularFile = path.resolve(__dirname, '../resources/multiple-config-files/config-without-refs.yaml');
            const referenceFile = path.resolve(__dirname, '../resources/multiple-config-files/config-with-refs.yaml');

            const regularYamlData = await parseConfigFile(regularFile);
            const referenceYamlData = await parseConfigFile(referenceFile);
            JSON.stringify(regularYamlData).should.eql(JSON.stringify(referenceYamlData));
        });
    });
});
