const assert = require('chai').assert;
const expect = require('chai').expect;
require('chai').should();
const request = require('supertest');

const path = require('path');
const fs = require('fs-extra');

const Walder = require('../lib/walder');

const CONFIG_FILE = './resources/config.yaml';
const CONFIG_FILE_NO_QUERY = './resources/config-no-query.yaml';
const CONFIG_FILE_IMAGE = './resources/config-image.yaml';
const CONFIG_FILE_HTMLVALIDATOR = './resources/config-htmlvalidator.yaml';
const CONFIG_FILE_DEFAULT_ERROR_PAGES = './resources/config-missing-default-error-pages.yaml';
const CONFIG_FILE_ERRORS_PUG = './resources/conf-x-walder-errors-pug.yaml'
const CONFIG_FILE_ERRORS_HANDLEBARS = './resources/conf-x-walder-errors-handlebars.yaml'
const CONFIG_FILE_ERRORS_MD = './resources/conf-x-walder-errors-md.yaml'
const CONFIG_FILE_FRONTMATTER = './resources/config-frontmatter.yaml'
const CONFIG_FILE_TWO_PATH_PARAMS = './resources/config-two-path-parameters.yaml'

describe('Walder', function () {

  describe('# Activation', function () {
    it('should throw an error when no config file is given', function () {
      expect(() => new Walder()).to.throw('Configuration file is required.')
    });

    // remark: on request, not using chai-as-promised here
    async function testActivationWithBadConfigFile(configFileName, textInErrorMessage) {
      const configFile = path.resolve(__dirname, configFileName);
      const walder = new Walder(configFile);
      let error;
      try {
        await walder.activate();
      } catch (e) {
        error = e;
      }
      assert.isDefined(error);
      error.should.be.instanceOf(Error);
      error.message.should.contain(textInErrorMessage);
    }

    it('should throw an error when the config file contains missing HTML files in a route', async function () {
      await testActivationWithBadConfigFile(CONFIG_FILE_HTMLVALIDATOR, `Config file validation error for route '/missing-html' - 'get':`);
    });

    it('should throw an error when the config file contains missing HTML files in the default error pages', async function () {
      let error = await testActivationWithBadConfigFile(CONFIG_FILE_DEFAULT_ERROR_PAGES, `Config file validation error for route 'any' - 'default error pages':`);
    });

    it('should be listening on the given port', async function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      const walder = new Walder(configFile, {port, logging: 'error'});
      await walder.activate();

      walder.server.listening.should.equal(true);
      walder.server.address().port.should.equal(port);

      walder.deactivate();
    });
  });

  describe('# Error pages (different from html)', function () {
    async function activateWithConfigFile(configFilename) {
      const configFile = path.resolve(__dirname, configFilename);
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging: 'error'});
      await this.walder.activate();
    }

    function checkResponse(route, textToBeContained, done) {
      request(this.walder.app)
          .get(route)
          .expect('Content-Type', /text\/html/)
          .expect(checkText)
          .end(done);

      function checkText(res) {
        expect(res.text).to.contain(textToBeContained);
      }
    }

    function deactivate() {
      this.walder.deactivate();
    }

    describe('## Error pages (pug)', function() {
      before('Activating Walder', async function () {
        await activateWithConfigFile(CONFIG_FILE_ERRORS_PUG);
      });

      after('Deactivating Walder', function () {
        deactivate();
      });

      it('Should serve 404 page based on pug input', function (done) {
        checkResponse('/thisPageDoesNotExit', 'This page was generated using error404alt.pug.', done);
      });

      it('Should serve 500 page based on pug input', function (done) {
        checkResponse('/bad_query', 'This page was generated using error500alt.pug.', done);
      });
    });

    describe('## Error pages (handlebars)', function() {
      before('Activating Walder', async function () {
        await activateWithConfigFile(CONFIG_FILE_ERRORS_HANDLEBARS);
      });

      after('Deactivating Walder', function () {
        deactivate();
      });

      it('Should serve 404 page based on handlebars input', function (done) {
        checkResponse('/thisPageDoesNotExit', 'This page was generated using error404alt.handlebars.', done);
      });

      it('Should serve 500 page based on handlebars input', function (done) {
        checkResponse('/bad_query', 'This page was generated using error500alt.handlebars.', done);
      });
    });

    describe('## Error pages (md)', function() {
      before('Activating Walder', async function () {
        await activateWithConfigFile(CONFIG_FILE_ERRORS_MD);
      });

      after('Deactivating Walder', function () {
        deactivate();
      });

      it('Should serve 404 page based on md input', function (done) {
        checkResponse('/thisPageDoesNotExit', 'This page was generated using error404alt.md.', done);
      });

      it('Should serve 500 page based on md input', function (done) {
        checkResponse('/bad_query', 'This page was generated using error500alt.md.', done);
      });
    });
  });

  describe('# Layouts', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, 'resources/layouts-test/config.yaml');
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging: 'error'});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    it('should use layout', function (done) {
      request(this.walder.app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .end(async (err, res) => {
          let actualOutput = res.text.replace(/\n/g,'');
          actualOutput = actualOutput.replace(/\r/g,'');
          let expectedOutput = await fs.readFile(path.resolve(__dirname, 'resources/layouts-test/expected-output.html'), 'utf8');
          expectedOutput = expectedOutput.replace(/\n/g,'');
          expectedOutput = expectedOutput.replace(/\r/g,'');
          expect(actualOutput).to.equal(expectedOutput);
          done();
        });
    });
  });

  describe('# Pug', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, 'resources/pug-include-test/config.yaml');
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging: 'error'});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    it('should use include', function (done) {
      request(this.walder.app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .end(async (err, res) => {
          let actualOutput = res.text.replace(/\n/g,'');
          actualOutput = actualOutput.replace(/\r/g,'');
          let expectedOutput = await fs.readFile(path.resolve(__dirname, 'resources/pug-include-test/expected-output.html'), 'utf8');
          expectedOutput = expectedOutput.replace(/\n/g,'');
          expectedOutput = expectedOutput.replace(/\r/g,'');
          expect(actualOutput).to.equal(expectedOutput);
          done();
        });
    });
  });

  it('should just return the HTML when no query is provided', function (done) {
    const configFile = path.resolve(__dirname, CONFIG_FILE_NO_QUERY);
    const port = 9000;

    this.walder = new Walder(configFile, {port, logging: 'error'});
    this.walder.activate();

    request(this.walder.app)
      .get('/')
      .expect(200, () => {
        this.walder.deactivate();
        done();
      });
  });

  it('Should return image in public folder', function (done) {
    const configFile = path.resolve(__dirname, CONFIG_FILE_IMAGE);
    const port = 9000;

    this.walder = new Walder(configFile, {port, logging: 'error'});
    this.walder.activate();

    request(this.walder.app)
      .get('/device.jpg')
      .expect(200, () => {
        this.walder.deactivate();
        done();
      });
  });

  describe('# FrontMatter metadata handling', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE_FRONTMATTER);
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging: 'error'});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    it('should provide FrontMatter metadata to view templates', function (done) {
      request(this.walder.app)
        .get('/text-fm')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(checkText)
        .end(done);

      function checkText(res) {
        expect(res.text).to.contain("Value for FrontMatter attribute a1!");
      }
    });

    it('should provide FrontMatter metadata to layout templates', function (done) {
      request(this.walder.app)
        .get('/text-fm-with-layout')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(checkText)
        .end(done);

      function checkText(res) {
        expect(res.text).to.contain("Value for FrontMatter attribute a2!");
      }
    });
  });

  describe('# Parameters in path', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE_TWO_PATH_PARAMS);
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging: 'error'});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    it('should process two parameters', function (done) {
      request(this.walder.app)
        .get('/season/Princeton%20Tigers/1869')
        .set('Accept', 'text/turtle')
        .expect('Content-Type', /text\/turtle/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        expect(res.text).to.contain("http://dbpedia.org/resource/1869_Princeton_Tigers_football_team");
      }
    });

    describe('should check minimum of integer', () => {
      it('minimum', function (done) {
        request(this.walder.app)
          .get('/season-2/1869')
          .set('Accept', 'text/turtle')
          .expect('Content-Type', /text\/turtle/)
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          expect(res.text).to.contain("http://dbpedia.org/resource/1869_Princeton_Tigers_football_team");
        }
      });

      it('above minimum', function (done) {
        request(this.walder.app)
          .get('/season-2/1870')
          .set('Accept', 'text/turtle')
          .expect('Content-Type', /text\/turtle/)
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          expect(res.text).to.contain("http://dbpedia.org/resource/1870_Columbia_football_team");
        }
      });

      it('below minimum', function (done) {
        request(this.walder.app)
          .get('/season-2/1800')
          .set('Accept', 'text/turtle')
          .expect(400)
          .end(done);
      });
    });

    describe('should check maximum of integer', () => {
      it('maximum', function (done) {
        request(this.walder.app)
          .get('/season-2/1870')
          .set('Accept', 'text/turtle')
          .expect('Content-Type', /text\/turtle/)
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          expect(res.text).to.contain("http://dbpedia.org/resource/1870_Columbia_football_team");
        }
      });

      it('below maximum', function (done) {
        request(this.walder.app)
          .get('/season-2/1869')
          .set('Accept', 'text/turtle')
          .expect('Content-Type', /text\/turtle/)
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          expect(res.text).to.contain("http://dbpedia.org/resource/1869_Princeton_Tigers_football_team");
        }
      });

      it('above maximum', function (done) {
        request(this.walder.app)
          .get('/season-2/1900')
          .set('Accept', 'text/turtle')
          .expect(400)
          .end(done);
      });
    });
  });
});
