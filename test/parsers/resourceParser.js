require('chai').should();
const expect = require('chai').expect;
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const ResourceParser = require('../../lib/parsers/resourceParser');

const CONFIG_FILE = 'test/resources/config_test_example.yaml';
const CONFIG_FILE_NO_RESOURCES = 'test/resources/config_test_example_no_resources.yaml';
const CONFIG_FILE_PARTIAL_RESOURCES = 'test/resources/config_test_example_partial_resources.yaml';

describe('ResourceParser', function () {
  {
    before(function () {
      const file = fs.readFileSync(path.resolve(CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);

      this.output = ResourceParser.parse(yamlData['x-walder-resources'], CONFIG_FILE);
    });

    afterEach(function () {
      // Remove 'public' directory created by the ResourceParser
      if(fs.existsSync('public')) {
        fs.rmdirSync('public');
      }
    });

    describe('#functionality()', function () {
      it('should be able to parse, extract and format resources information correctly from a YAML config file', function () {
        this.output.should.eql(
          {
            "path": path.resolve('example'),
            "views": path.resolve('example', 'views'),
            "pipe-modules": path.resolve('example', 'pipeModules'),
            "public": path.resolve('example', 'public'),
            "layouts": path.resolve('example', 'layouts'),
          }
        )
      });

      it('should be able to handle config files without a resources section and use default values instead', function () {
        const file = fs.readFileSync(path.resolve(CONFIG_FILE_NO_RESOURCES), 'utf8');
        const yamlData = YAML.parse(file);

        const output = ResourceParser.parse(yamlData, CONFIG_FILE_NO_RESOURCES);
        output.should.eql({
          path: path.resolve('./'),
          views: path.resolve('./'),
          'pipe-modules': path.resolve('./'),
          public: path.resolve('public'),
          layouts: path.resolve('layouts')
        })
      });

      it('should be able to handle empty resource fields and use default values instead', function () {
        const file = fs.readFileSync(path.resolve(CONFIG_FILE_PARTIAL_RESOURCES), 'utf8');
        const yamlData = YAML.parse(file);

        const output = ResourceParser.parse(yamlData, CONFIG_FILE_PARTIAL_RESOURCES);
        output.should.eql({
          path: path.resolve('./'),
          views: path.resolve('./'),
          'pipe-modules': path.resolve('./'),
          public: path.resolve('public'),
          layouts: path.resolve('layouts')
        })
      });

      it('should create a public directory with the given path if it does not exist yet', function () {
        const file = fs.readFileSync(path.resolve(CONFIG_FILE_NO_RESOURCES), 'utf8');
        const yamlData = YAML.parse(file);

        const output = ResourceParser.parse(yamlData, CONFIG_FILE_NO_RESOURCES);

        fs.existsSync(output.public).should.be.true;
      });
    });

    describe('#outputFormat()', function () {
      it('output object should have {path, views, pipeModules, public} properties', function () {
        this.output.should.have.property('path');
        this.output.should.have.property('views');
        this.output.should.have.property('pipe-modules');
        this.output.should.have.property('public');
      });

      it('output object\'s values should always be absolute paths', function () {
        path.isAbsolute(this.output.path).should.be.true;
        path.isAbsolute(this.output.views).should.be.true;
        path.isAbsolute(this.output['pipe-modules']).should.be.true;
        path.isAbsolute(this.output.public).should.be.true;
      });
    });

  }
});
