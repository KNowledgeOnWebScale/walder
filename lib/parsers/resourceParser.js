const Parser = require('./parser');
const Path = require('path');

const DEFAULT_RESOURCES = {
  path: './',
  views: 'views',
  pipeModules: 'pipeModules',
  public: 'public'
};

/**
 * Parses the meta and converts it into GraphQLLD objects.
 *
 * @type {module.ResourceParser}
 */
module.exports = class ResourceParser extends Parser {
  constructor(data, configFile) {
    super(data);
    this.configFile = configFile;
  }

  parse() {
    const resources = {};
    if (this.data) {
      if (this.data.path) {
        if (Path.isAbsolute(this.data.path)) {
          resources.path = this.data.path;
        } else {
          resources.path = Path.resolve(Path.dirname(this.configFile), this.data.path);
        }
      } else {
        resources.path = Path.resolve(DEFAULT_RESOURCES.path);
      }

      resources.views = this.data.views ? this.data.views : DEFAULT_RESOURCES.views;
      resources['pipe-modules'] = this.data['pipe-modules'] ? this.data['pipe-modules'] : DEFAULT_RESOURCES.pipeModules;

      resources.public = this.data.public ? this.data.public : DEFAULT_RESOURCES.public;

      return resources;
    }
    else {
      return DEFAULT_RESOURCES;
    }
  }
};