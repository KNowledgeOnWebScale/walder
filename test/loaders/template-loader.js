const TemplateLoader = require("../../lib/loaders/template-loader");
const fs = require("fs");
const HTMLInfo = require("../../lib/models/html-info");
require('chai').should();

describe('PipeModuleLoader', function () {
    it('should return a string with the content of a template if it was loaded earlier without reading from the file', function () {
        const htmlInfo = new HTMLInfo(undefined, "test_template_loader_temp.txt");
        const templateLoader = new TemplateLoader();
        fs.writeFileSync(htmlInfo.file, "test");
        const init = templateLoader.load(htmlInfo);
        fs.unlinkSync(htmlInfo.file);
        templateLoader.load(htmlInfo).should.deep.equal(init)
    })
});
