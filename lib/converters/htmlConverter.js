const Converter = require('./converter');
const cons = require('consolidate');

module.exports = class HtmlConverter extends Converter {
  constructor() {
    super();
  }

  static convert(htmlInfo, data, callBack) {
    cons[htmlInfo.engine](htmlInfo.file, { data })
      .then((html) => {
        callBack(html)
      })
      .catch((error) => {
        throw error;
      });
  }
};