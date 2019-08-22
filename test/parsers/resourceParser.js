require('chai').should();
const expect = require('chai').expect;
const YAML = require('yaml');
const fs = require('fs');
const Path = require('path');
const ResourceParser = require('../../lib/parsers/resourceParser');

const CONFIG_FILE = 'test/resources/config_test_example.yaml';
const CONFIG_FILE_NO_RESOURCES = 'test/resources/config_test_example_no_resources.yaml';
const CONFIG_FILE_PARTIAL_RESOURCES = 'test/resources/config_test_example_partial_resources.yaml';

describe('ResourceParser', function () {
  {
    before(function () {
      const file = fs.readFileSync(Path.resolve(CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);

      const resourceParser = new ResourceParser(yamlData.resources, CONFIG_FILE);
      this.output = resourceParser.parse();
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
            "path": Path.resolve('example'),
            "views": Path.resolve('example', 'views'),
            "pipe-modules": Path.resolve('example', 'pipeModules'),
            "public": Path.resolve('example', 'public')
          }
        )
      });

      it('should be able to handle config files without a resources section and use default values instead', function () {
        const file = fs.readFileSync(Path.resolve(CONFIG_FILE_NO_RESOURCES), 'utf8');
        const yamlData = YAML.parse(file);

        const resourceParser = new ResourceParser(yamlData, CONFIG_FILE_NO_RESOURCES);
        const output = resourceParser.parse();
        output.should.eql({
          path: Path.resolve('./'),
          views: Path.resolve('./'),
          'pipe-modules': Path.resolve('./'),
          public: Path.resolve('public')
        })
      });

      it('should be able to handle empty resource fields and use default values instead', function () {
        const file = fs.readFileSync(Path.resolve(CONFIG_FILE_PARTIAL_RESOURCES), 'utf8');
        const yamlData = YAML.parse(file);

        const resourceParser = new ResourceParser(yamlData, CONFIG_FILE_PARTIAL_RESOURCES);
        const output = resourceParser.parse();
        output.should.eql({
          path: Path.resolve('./'),
          views: Path.resolve('./'),
          'pipe-modules': Path.resolve('./'),
          public: Path.resolve('public')
        })
      });

      it('should create a public directory with the given path if it does not exist yet', function () {
        const file = fs.readFileSync(Path.resolve(CONFIG_FILE_NO_RESOURCES), 'utf8');
        const yamlData = YAML.parse(file);

        const resourceParser = new ResourceParser(yamlData, CONFIG_FILE_NO_RESOURCES);
        const output = resourceParser.parse();

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
        Path.isAbsolute(this.output.path).should.be.true;
        Path.isAbsolute(this.output.views).should.be.true;
        Path.isAbsolute(this.output['pipe-modules']).should.be.true;
        Path.isAbsolute(this.output.public).should.be.true;
      });
    });

  }
});