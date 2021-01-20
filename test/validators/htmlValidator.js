require('chai').should();
const expect = require('chai').expect;

const HTMLValidator = require('../../lib/validators/html-validator');
const RouteInfo = require('../../lib/models/route-info');
const parseResources = require('../../lib/parsers/resource-parser');
const parseHTML = require('../../lib/parsers/html-parser');

const YAML = require('yaml');
const fs = require('fs');
const Path = require('path');

const CONFIG_FILE = '../resources/config-missing-html.yaml';

describe('HTMLValidator', function () {
  {
    before(function () {
      const fileAbsPath = Path.resolve(__dirname, CONFIG_FILE);
      const file = fs.readFileSync(fileAbsPath, 'utf8');
      this.yamlData = YAML.parse(file);
      this.resources = parseResources(this.yamlData['x-walder-resources'], Path.dirname(fileAbsPath));
      this.htmlValidator = new HTMLValidator();
    });

    describe('# Files', function () {
      it('Should return \'undefined\' when all HTML and template files are available', async function () {
        const path = '/simple';
        const method = 'get';
        const routeInfo = new RouteInfo(path, method);
        const htmlInfoDictionary = parseHTML(this.yamlData.paths[path][method].responses, this.resources.views, this.resources.layouts);
        const output = await this.htmlValidator.validate({routeInfo, htmlInfoDictionary});
        expect(output).to.be.undefined;
      });

      it('Should return an error string when there are unavailable HTML or template files', async function () {
        const path = '/missing-html';
        const method = 'get';
        const routeInfo = new RouteInfo(path, method);
        const htmlInfoDictionary = parseHTML(this.yamlData.paths[path][method].responses, this.resources.views, this.resources.layouts);
        const output = await this.htmlValidator.validate({routeInfo, htmlInfoDictionary});
        output.should.be.a.string;
        output.should.include('missing-template.pug');
        output.should.include('missing-html.html');
      });
    })
  }
});
