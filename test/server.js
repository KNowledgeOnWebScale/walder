const assert = require('chai').assert;
const expect = require('chai').expect;
require('chai').should();
const request = require('supertest');
const path = require('path');
const Walter = require('../lib/walter');

const CONFIG_FILE = 'test/resources/config_test_example.yaml';

describe('Walter', function () {

  describe('#Activation', function () {
    it('should throw an error when no config file is given', function () {
      expect(() => new Walter()).to.throw('Configuration file is required.')
    });

    it('should be listening on the given port', function () {
      const port = 9000;

      const walter = new Walter(CONFIG_FILE, port);
      walter.activate();

      walter.server.listening.should.equal(true);
      walter.server.address().port.should.equal(port);

      walter.deactivate();
    });
  });

  describe('#Functionality', function () {
    before('Activating Walter', function () {
      const port = 9000;

      this.walter = new Walter(CONFIG_FILE, port);
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

    xit('should execute the GraphQL-LD queries linked to a route', function (done) {  // TODO: reactivate this test when content-negotiation (#31) is supported
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .expect(check)
        .end(done);

      function check(res) {
        assert('data' in res.body, 'GraphQL-LD query not correctly executed');
      }
    });

    xit('should apply the specified pipe modules', function (done) {  // TODO: reactivate this test when content-negotiation (#31) is supported
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