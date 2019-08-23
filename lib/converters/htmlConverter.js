const Converter = require('./converter');
const cons = require('consolidate');
const fs = require('fs');

module.exports = class HtmlConverter extends Converter {
  constructor() {
    super();
  }

  static convert(htmlInfo, data, callBack) {
    if (htmlInfo.engine === 'html') {
      const html = fs.readFileSync(htmlInfo.file)
      callBack(html);
    } else {
      cons[htmlInfo.engine](htmlInfo.file, { data }, (error, html) => {
        if (error) {
          throw error;
        }
        callBack(html);
      })
    }
  }
};