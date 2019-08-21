const Parser = require('./parser');
const MetaInfo = require('../models/metaInfo');
const DataSourceParser = require('./dataSourceParser');
const ResourceParser = require('./resourceParser');

/**
 * Parses the meta section and returns it as a MetaInfo object.
 *
 * @type {module.MetaParser}
 */
module.exports = class MetaParser extends Parser {
  constructor(data, configFile) {
    super(data);
    this.dataSourceParser = new DataSourceParser(this.data.datasources);
    this.resourceParser = new ResourceParser(this.data.resources, configFile);
  }

  parse() {
    const datasources = this.dataSourceParser.parse();
    const resources = this.resourceParser.parse();

    return new MetaInfo(datasources, resources);
  }
};