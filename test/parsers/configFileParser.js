require('chai').should();
const expect = require('chai').expect;

const parseConfigFile = require('../../lib/parsers/configFileParser');
const path = require('path');

describe('ConfigFileParser', function () {

  it('should be able to resolve the references in a config file and give an equal config file', async function() {
      const regularFile = path.resolve(__dirname, '../resources/multiple-config-files/config-without-refs.yaml');
      const referenceFile = path.resolve(__dirname, '../resources/multiple-config-files/config-with-refs.yaml');

      const regularYamlData = await parseConfigFile(regularFile);
      const referenceYamlData = await parseConfigFile(referenceFile);
      JSON.stringify(regularYamlData).should.eql(JSON.stringify(referenceYamlData));
  });

  it('should give an error because paths of refs are invalid', async function() {
    const file = path.resolve(__dirname, '../resources/multiple-config-files/config-with-invalid-refs.yaml');
    let actualError = null;

    try {
      await parseConfigFile(file);
    } catch (err) {
      actualError = err;
    } finally {
      expect(actualError).to.not.be.null;
    }
  });
});
