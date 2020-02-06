require('chai').should();
const isHTML = require('is-html');
const HtmlConverter = require('../../lib/converters/htmlConverter');

const EX_1_HTML_INFO = require('../resources/exampleData').EX_1_HTML_CONVERTER_HTML_INFO;
const EX_1_DATA = require('../resources/exampleData').EX_1_HTML_CONVERTER_DATA;
const EX_2_HTML_INFO = require('../resources/exampleData').EX_2_HTML_CONVERTER_HTML_INFO;

describe('HtmlConverter', function () {

  before(function () {
  });

  describe('#functionality()', function () {
    it('should be able to convert the given JSON to HTML using the given template and engine', function (done) {
      HtmlConverter.convert(EX_1_HTML_INFO, EX_1_DATA, (html) => {
        isHTML(html).should.be.true;
        done();
      })
    });

    it('should be able to convert the given Markdown to HTML', function (done) {
      HtmlConverter.convert(EX_2_HTML_INFO, null, (html) => {
        isHTML(html).should.be.true;
        done();
      })
    });
  })
});
