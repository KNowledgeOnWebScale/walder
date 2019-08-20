const Converter = require('./converter');

module.exports = class JSONLDConverter extends Converter {
  constructor() {
    super();
  }

  static convert(data, graphQLLD) {
    const result = {};

    // Add @context
    result['@context'] = graphQLLD.context['@context'];

    this.structureData(data);

    // Add @graph
    result['@graph'] = data;

    return result;
  }

  static structureData(data) {
    if ('id' in data[0]) {
      data.forEach((o) => {
        o['@id'] = o.id;
        delete o.id;
      });
    }
  }
};