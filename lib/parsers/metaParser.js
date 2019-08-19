const Parser = require('./parser');

const DataSourceParser = require('./dataSourceParser');
const ResourceParser = require('./resourceParser');

class MetaInfo {
  constructor(dataSources, resources) {
    this.dataSources = dataSources;
    this.resources = resources;
  }
}

module.exports = class MetaParser extends Parser {
  constructor(data) {
    super(data);
    this.dataSourceParser = new DataSourceParser(this.data.datasources);
    this.resourceParser = new ResourceParser(this.data.resources);
  }

  parse() {
    const datasources = this.dataSourceParser.parse();
    const resources = this.resourceParser.parse();

    return new MetaInfo(datasources, resources);
  }
};