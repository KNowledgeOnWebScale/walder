const TemplateLoader = require("../../lib/loaders/template-loader");
const fs = require("fs");
const HTMLInfo = require("../../lib/models/html-info");
require('chai').should();

describe('PipeModuleLoader', function () {
    it('should return a string with the content of a template if it was loaded earlier without reading from the file', function () {
        const htmlInfo = new HTMLInfo(undefined, "test_template_loader_temp.txt");
        const templateLoader = new TemplateLoader();
        fs.writeFileSync(htmlInfo.file, "test");
        templateLoader.load(htmlInfo);
        fs.unlinkSync(htmlInfo.file);
        templateLoader.getTemplateFromCache(htmlInfo).body.should.deep.equal("test");
    });

    it('should return a string with the content of a layout, when a template extending that layout has been cached earlier', function () {
        const htmlInfo = new HTMLInfo("pug", "test/resources/views/layout_test.pug", "test", "test/resources/layouts");
        const templateLoader = new TemplateLoader();
        templateLoader.load(htmlInfo);
        console.log(templateLoader.getTemplateFromCache(new HTMLInfo("pug", "test\\resources\\layouts\\simple_layout.pug")));
    });
});
