/**
 * Contains the information from the meta section of the config file:
 *  - the global datasources
 *  - the resource paths
 *
 * @type {module.MetaInfo}
 */
module.exports = class MetaInfo {
  constructor(dataSources, resources) {
    this.dataSources = dataSources;
    this.resources = resources;
  }
};