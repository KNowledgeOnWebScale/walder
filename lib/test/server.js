const assert = require('chai').assert;
const expect = require('chai').expect;
require('chai').should();
const request = require('supertest');
const path = require('path');
const Walter = require('../../lib/walter');

const CONFIG_FILE = './resources/config_test_example.yaml';

describe('Walter', function () {

  describe('#Activation', function () {
    it('should throw an error when no config file is given', function () {
      expect(() => new Walter()).to.throw('Configuration file is required.')
    });

    it('should be listening on the given port', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      const walter = new Walter(configFile, port);
      walter.activate();

      walter.server.listening.should.equal(true);
      walter.server.address().port.should.equal(port);

      walter.deactivate();
    });
  });

  describe('#Functionality', function () {
    before('Activating Walter', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      this.walter = new Walter(configFile, port);
      this.walter.activate();
    });

    after('Deactivating Walter', function () {
      this.walter.deactivate();
    });

    it('should make the routes specified in the config file available', function (done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .expect(200, done);
    });

    it('should execute the GraphQL-LD queries linked to a route', function (done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .expect(check)
        .end(done);

      function check(res) {
        assert('data' in res.body, 'GraphQL-LD query not correctly executed');
      }
    });

    it('should apply the specified pipe modules', function(done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .expect(check)
        .end(done);

      function check(res) {
        const filter = require('./resources/filterT').filterT;

        const origLength = res.body.data.length;
        const filteredData = filter(res.body);

        assert.lengthOf(filteredData.data, origLength, 'Pipe module probably not applied');
      }
    });
  })
});