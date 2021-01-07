require('chai').should();
const request = require('supertest');
const path = require('path');
const Walder = require('../../lib/walder');

const CONFIG_FILE = '../../example/config.yaml';

describe('Example', function () {

  describe('# Favicon', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging:'error'});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    it('should serve /favicon.ico', function (done) {
      request(this.walder.app)
          .get('/favicon.ico')
          .expect(200)
          .end(done);
    });
  });
});
