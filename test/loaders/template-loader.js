const TemplateLoader = require("../../lib/loaders/template-loader");
const fs = require("fs");
const HTMLInfo = require("../../lib/models/html-info");
const path = require('path');
require('chai').should();

describe('TemplateLoader', function () {
    it('should return a string with the content of a template if it was loaded earlier without reading from the file', function () {
        const htmlInfo = new HTMLInfo("pug", "test/resources/views/text.pug");
        const templateLoader = new TemplateLoader();
        templateLoader.load(htmlInfo);
        templateLoader.getTemplateFromCache(htmlInfo).body.should.contain("Hello World!");
    });

    it('should return a string with the content of a layout, when a template extending that layout has been cached earlier', function () {
        const htmlInfo = new HTMLInfo("pug", "test/resources/views/layout_test.pug", "test", "test/resources/layouts");
        const templateLoader = new TemplateLoader();
        templateLoader.load(htmlInfo);
        templateLoader.getTemplateFromCache(new HTMLInfo("pug", path.join(htmlInfo.layoutsDir, "simple-layout.pug"))).body.should.contain("Hello World!");
    });
});
