require('chai').should();
const isHTML = require('is-html');
const HtmlConverter = require('../../lib/converters/html-converter');

const EX_1_HTML_INFO = require('../resources/example-data').EX_1_HTML_CONVERTER_HTML_INFO;
const EX_1_DATA = require('../resources/example-data').EX_1_HTML_CONVERTER_DATA;
const EX_2_HTML_INFO = require('../resources/example-data').EX_2_HTML_CONVERTER_HTML_INFO;
const EX_3_HTML_INFO = require('../resources/example-data').EX_3_HTML_CONVERTER_HTML_INFO;
const EX_3_DATA = require('../resources/example-data').EX_3_HTML_CONVERTER_DATA;
const EX_3_OUTPUT = require('../resources/example-data').EX_3_HTML_CONVERTER_OUTPUT;
const EX_4_HTML_INFO = require('../resources/example-data').EX_4_HTML_CONVERTER_HTML_INFO;
const EX_4_OUTPUT = require('../resources/example-data').EX_4_HTML_CONVERTER_OUTPUT;

describe('HtmlConverter', function () {

  before(function () {
  });

  describe('# Functionality', function () {
    it('should be able to convert the given JSON to HTML using the given template and engine', async () => {
      const html = await HtmlConverter.convert(EX_1_HTML_INFO, EX_1_DATA);
      isHTML(html).should.be.true;
    });

    it('should be able to convert the given Markdown to HTML', async () => {
      const html = await HtmlConverter.convert(EX_2_HTML_INFO, null);
      isHTML(html).should.be.true;
    });

    it('should be able to convert the given Pug with front matter to HTML', async () => {
      const html = await HtmlConverter.convert(EX_3_HTML_INFO, EX_3_DATA);
      isHTML(html).should.be.true;
      html.should.deep.equal(EX_3_OUTPUT);
    });

    it('should be able to convert the given markdown with a layout to HTML', async () => {
      const html = await HtmlConverter.convert(EX_4_HTML_INFO, null);
      isHTML(html).should.be.true;
      html.should.deep.equal(EX_4_OUTPUT);
    });

    it(`should be able to provide a default HTML, when calling convertWithDefault with input that otherwise can't be converted`, async () => {
      const testMessage = 'test-with-default';
      const html = await HtmlConverter.convertWithDefault(null, null, testMessage);
      isHTML(html).should.be.true;
      html.should.include(testMessage);
    });
  })
});
