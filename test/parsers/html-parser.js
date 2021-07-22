require('chai').should();
const parseHTML = require('../../lib/parsers/html-parser');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const CONFIG_FILE = '../resources/config.yaml';
const NJK_CONFIG_FILE = '../resources/config-njk.yaml';

describe('HtmlParser', function () {
  {
    before(function () {
      const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');
      const yamlData = YAML.parse(file);
      this.output = parseHTML(yamlData.paths['/movies/{actor}']['get'].responses, '', '');
    });

    describe('# Functionality', function () {
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

      it('should be able to recognize .njk as a nunjuck file', function () {
        const njkFile = fs.readFileSync(path.resolve(__dirname, NJK_CONFIG_FILE), 'utf8');
        const njkYamlData = YAML.parse(njkFile);
        parseHTML(njkYamlData.paths['/njk']['get'].responses, '', '')['200'].engine.should.eql('nunjuck');
      });

    });

    describe('# Output format', function () {
      it('output object should have {statusCode: {engine, file}} properties', function () {
        this.output.should.have.property('200');
        this.output['200'].should.have.property('engine');
        this.output['200'].should.have.property('file');
      })
    });

  }
});
