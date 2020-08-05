require('chai').should();

const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const parseResources = require('../../lib/parsers/resourceParser');

const CONFIG_FILE = 'test/resources/config_test_example.yaml';
const CONFIG_FILE_NO_RESOURCES = 'test/resources/config_test_example_no_resources.yaml';
const CONFIG_FILE_PARTIAL_RESOURCES = 'test/resources/config_test_example_partial_resources.yaml';

describe('ResourceParser', function () {

  afterEach(function () {
    // Remove 'public' directory created by the ResourceParser
    if(fs.existsSync('public')) {
      fs.rmdirSync('public');
    }
  });

  describe('#functionality()', function () {
    it('should be able to parse, extract and format resources information correctly from a YAML config file', function () {
      const file = fs.readFileSync(path.resolve(CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);
      const cwd = path.resolve(__dirname, '../resources');

      const output = parseResources(yamlData['x-walder-resources'], cwd);

      output.should.eql(
        {
          "path": path.resolve('test/resources'),
          "views": path.resolve('test/resources', 'views'),
          "pipe-modules": path.resolve('test/resources', 'pipeModules'),
          "public": path.resolve('test/resources', 'public'),
          "layouts": path.resolve('test/resources', 'layouts'),
        }
      )
    });

    it('should be able to handle config files without a resources section and use default values instead', function () {
      const file = fs.readFileSync(path.resolve(CONFIG_FILE_NO_RESOURCES), 'utf8');
      const yamlData = YAML.parse(file);
      const cwd = path.resolve(__dirname, '../resources');

      const output = parseResources(yamlData, cwd);
      output.should.eql({
        path: cwd,
        views: cwd,
        'pipe-modules': cwd,
        public: path.resolve(cwd, 'public'),
        layouts: path.resolve(cwd, 'layouts')
      })
    });

    it('should be able to handle empty resource fields and use default values instead', function () {
      const file = fs.readFileSync(path.resolve(CONFIG_FILE_PARTIAL_RESOURCES), 'utf8');
      const yamlData = YAML.parse(file);
      const cwd = path.resolve(__dirname, '../resources');

      const output = parseResources(yamlData, cwd);
      output.should.eql({
        path: cwd,
        views: cwd,
        'pipe-modules': cwd,
        public: path.resolve(cwd, 'public'),
        layouts: path.resolve(cwd, 'layouts')
      })
    });

    it('should create a public directory with the given path if it does not exist yet', function () {
      const file = fs.readFileSync(path.resolve(CONFIG_FILE_NO_RESOURCES), 'utf8');
      const yamlData = YAML.parse(file);
      const cwd = path.resolve(__dirname, '../resources');

      const output = parseResources(yamlData, cwd);

      fs.existsSync(output.public).should.be.true;
    });
  });

  describe('#outputFormat()', function () {
    const file = fs.readFileSync(path.resolve(CONFIG_FILE), 'utf8');
    const yamlData = YAML.parse(file);
    const cwd = path.resolve(__dirname, '../resources');

    output = parseResources(yamlData['x-walder-resources'], cwd);

    it('output object should have {path, views, pipeModules, public} properties', function () {
      output.should.have.property('path');
      output.should.have.property('views');
      output.should.have.property('pipe-modules');
      output.should.have.property('public');
    });

    it('output object\'s values should always be absolute paths', function () {
      path.isAbsolute(output.path).should.be.true;
      path.isAbsolute(output.views).should.be.true;
      path.isAbsolute(output['pipe-modules']).should.be.true;
      path.isAbsolute(output.public).should.be.true;
    });
  });
});
