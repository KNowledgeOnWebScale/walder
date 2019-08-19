const Converter = require('./converter');
const cons = require('consolidate');

module.exports = class HtmlConverter extends Converter {
  constructor() {
    super();
  }

  static convert(htmlInfo, data) {
    return cons[htmlInfo.engine](htmlInfo.file, { data: data });
  }
};