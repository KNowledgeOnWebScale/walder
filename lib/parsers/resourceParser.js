const Parser = require('./parser');

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
  constructor(data) {
    super(data);
    console.log(data);
  }

  parse() {
    const resources = {};
    if (this.data) {
      resources.path = this.data.path ? this.data.path : DEFAULT_RESOURCES.path;
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