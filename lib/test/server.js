const expect = require('chai').expect;
require('chai').should();
const axios = require('axios');
const path = require('path');
const Walter = require('../../lib/walter');

describe('Walter', function () {

  describe('#Activation', function () {
    it('should throw an error when no config file is given', function () {
      expect(() => new Walter()).to.throw('Configuration file is required.')
    });

    it('should be listening on the given port', function () {
      const configFile = path.resolve(__dirname, './config_test_example.yaml');
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
      const configFile = path.resolve(__dirname, './config_test_example.yaml');
      const port = 9000;

      this.walter = new Walter(configFile, port);
      this.walter.activate();
    });

    after('Deactivating Walter', function () {
      this.walter.deactivate();
    });

    it('should make the routes specified in the config file available', function (done) {
      axios.get('http://localhost:9000/movies/Angelina_Jolie')
        .then((result) => {
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should execute the GraphQL-LD queries linked to a route');

    it('should apply the specified pipe modules');
  })
});