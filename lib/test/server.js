const expect = require('chai').expect;
require('chai').should();
const path = require('path');
const walter = require('../../lib/walter');

describe('Walter', function() {

  describe('#Activation', function() {
    it('should throw an error when no config file is given', function() {
      expect(() => walter.activate()).to.throw('Configuration file is required.')
    });

    it('should be listening on the given port', function() {
      const port = 9000;

      const output = walter.activate(path.resolve(__dirname, './config_test_example.yaml'), port);
      output.server.listening.should.equal(true);
      output.server.address().port.should.equal(port);
    });
  });

  describe('#Functionality', function() {
    it('should make the routes specified in the config file available');

    it('should execute the GraphQL-LD queries linked to a route');

    it('should apply the specified pipe modules');
  })
});