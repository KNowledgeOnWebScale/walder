const Parser = require('./parser');

const DEFAULT_RESOURCES = {
  path: './',
  views: 'views',
  pipeModules: 'pipeModules',
  public: {
    path: 'public',
    images: 'images',
    stylesheets: 'stylesheets',
    javascripts: 'javascripts'
  }
};

/**
 * Parses the meta and converts it into GraphQLLD objects.
 *
 * @type {module.MetaParser}
 */
module.exports = class MetaParser extends Parser {
  constructor(data) {
    super(data);
  }

  parse() {
    let base = this.data.meta;
    const resources = {};
    if (base && base.resources) {
      base = base.resources;

      resources.path = base.path ? base.path : DEFAULT_RESOURCES.path;
      resources.views = base.views ? base.views : DEFAULT_RESOURCES.views;
      resources['pipe-modules'] = base['pipe-modules'] ? base['pipe-modules'] : DEFAULT_RESOURCES.pipeModules;

      resources.public = {};

      base = base.public;
      if (base) {
        resources.public.path = base.path ? base.path : DEFAULT_RESOURCES.public.path;
        resources.public.images = base.images ? base.images : DEFAULT_RESOURCES.public.images;
        resources.public.stylesheets = base.stylesheets ? base.stylesheets : DEFAULT_RESOURCES.public.stylesheets;
        resources.public.javascripts = base.javascripts ? base.javascripts : DEFAULT_RESOURCES.public.javascripts;
      } else {
        resources.public = DEFAULT_RESOURCES.public;
      }

      return resources;
    }
    else {
      return DEFAULT_RESOURCES;
    }
  }
};