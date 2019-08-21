const Parser = require('./parser');
const Path = require('path');
const fs = require('fs');

const DEFAULT_RESOURCES = {
  path: './',
  views: '',
  pipeModules: '',
  public: 'public'
};

/**
 * Parses the meta and returns it as a MetaInfo object.
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
      if (! Path.isAbsolute(resources.views)) {
        resources.views = Path.resolve(resources.path, resources.views)
      }

      resources['pipe-modules'] = this.data['pipe-modules'] ? this.data['pipe-modules'] : DEFAULT_RESOURCES.pipeModules;
      if (! Path.isAbsolute(resources['pipe-modules'])) {
        resources['pipe-modules'] = Path.resolve(resources.path, resources['pipe-modules']);
      }

      resources.public = this.data.public ? this.data.public : DEFAULT_RESOURCES.public;
      if (! Path.isAbsolute(resources.public)) {
        resources.public = Path.resolve(resources.path, resources.public);
      }
      // check if public directory already exists, create if not
      if (!fs.existsSync(resources.public)) {
        fs.mkdirSync(resources.public, {recursive: true});
      }

      return resources;
    }
    else {
      return DEFAULT_RESOURCES;
    }
  }
};