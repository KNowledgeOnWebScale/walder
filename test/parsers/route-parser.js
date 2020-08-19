require('chai').should();

const fs = require('fs');
const path = require('path');
const parseRoute = require('../../lib/parsers/route-parser');

const CONFIG_FILE = '../resources/config.yaml';

describe('RouteParser', function () {
  {
    before(function () {
      const file = fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8');

      this.output = parseRoute('/movies/{actor}', 'get');
    });

    describe('# Functionality', function () {
      it('should be able to parse, extract and format route information correctly from a YAML config file', function () {
        this.output.should.eql(
          {
            "path": "/movies/:actor",
            "method": "get"
          }
        )
      });
    });

    describe('# Output format', function () {
      it('output object should have {path, method} properties', function () {
        this.output.should.have.property('path');
        this.output.should.have.property('method');
      })
    });

  }
});
