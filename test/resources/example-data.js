const path = require('path');
const HTMLInfo = require("../../lib/models/html-info");
const { DataFactory } = require('n3');
const { namedNode, literal, defaultGraph, quad } = DataFactory;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
//                                                    HtmlConverter                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const EX_1_HTML_CONVERTER_HTML_INFO = {
  engine: 'pug',
  file: path.resolve('test/resources/movies.pug')
};
const EX_1_HTML_CONVERTER_DATA = {
  data: [
    {
      id: {termType: "namedNode", value: 'http://dbpedia.org/resource/A_Mighty_Heart_(film)'}
    },
    {
      id: {termType: "namedNode", value: 'http://dbpedia.org/resource/Alexander_(2004_film)'}
    },
    {
      id: {termType: "namedNode", value: 'http://dbpedia.org/resource/Beowulf_(2007_film)'}
    }
  ]
};

const EX_2_HTML_CONVERTER_HTML_INFO = {
  engine: 'md',
  file: path.resolve('test/resources/test.md')
};

const EX_3_HTML_CONVERTER_HTML_INFO = {
  engine: 'pug',
  file: path.resolve('test/resources/book.pug')
};
const EX_3_HTML_CONVERTER_DATA = {
  description: 'Test description.'
};
const EX_3_HTML_CONVERTER_OUTPUT = '<h1>My book</h1><div>Test description.</div>';

const EX_4_HTML_CONVERTER_HTML_INFO = {
  engine: 'md',
  file: path.resolve('test/resources/test-layout.md'),
  layoutsDir: path.resolve('test/resources/')
};
const EX_4_HTML_CONVERTER_OUTPUT = '<!DOCTYPE html><html lang="en"><head><title>Layout</title></head><body><h1>Introduction</h1>\n' +
  '<p>This is an introduction to something cool.</p>\n' +
  '</body></html>';

const EX_5_HTML_CONVERTER_HTML_INFO = new HTMLInfo(
  'md',
  path.resolve('test/resources/layout-in-layout-test/page.md'),
  'test',
  path.resolve('test/resources/layout-in-layout-test/')
);
const EX_5_HTML_CONVERTER_OUTPUT = '<body><p>test</p>\n</body>';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
//                                                    RdfConverter                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const EX_1_RDF_CONVERTER_GRAPHQLLD = {
  context: {
    "@context": {
      "label": {"@id": "http://www.w3.org/2000/01/rdf-schema#label", "@language": "en"},
      "starring": "http://dbpedia.org/ontology/starring"
    }
  }
};

const EX_1_RDF_CONVERTER_DATA = {
  data: [
    {
      "id": {termType: "namedNode", value: "http://dbpedia.org/resource/A_Mighty_Heart_(film)"},
      "starring": {termType: "namedNode", value: "http://dbpedia.org/resource/Angelina_Jolie"}
    },
    {
      "id": {termType: "namedNode", value: "http://dbpedia.org/resource/Alexander_(2004_film)"},
      "starring": {termType: "namedNode", value: "http://dbpedia.org/resource/Angelina_Jolie"}
    },
    {
      "id": {termType: "namedNode", value: "http://dbpedia.org/resource/Beowulf_(2007_film)"},
      "starring": {termType: "namedNode", value: "http://dbpedia.org/resource/Angelina_Jolie"}
    }
  ]
};

const EX_2_RDF_CONVERTER_GRAPHQLLD = {
  context: {
    "@context": {
      "label": {"@id": "http://www.w3.org/2000/01/rdf-schema#label", "@language": "en"},
      "starring": "http://dbpedia.org/ontology/starring"
    }
  }
};

const EX_2_RDF_CONVERTER_DATA = {
  data: []
};


module.exports = {
  EX_1_HTML_CONVERTER_HTML_INFO,
  EX_1_HTML_CONVERTER_DATA,
  EX_2_HTML_CONVERTER_HTML_INFO,
  EX_3_HTML_CONVERTER_HTML_INFO,
  EX_3_HTML_CONVERTER_DATA,
  EX_3_HTML_CONVERTER_OUTPUT,
  EX_4_HTML_CONVERTER_HTML_INFO,
  EX_4_HTML_CONVERTER_OUTPUT,
  EX_5_HTML_CONVERTER_HTML_INFO,
  EX_5_HTML_CONVERTER_OUTPUT,
  EX_1_RDF_CONVERTER_GRAPHQLLD,
  EX_1_RDF_CONVERTER_DATA,
  EX_2_RDF_CONVERTER_GRAPHQLLD,
  EX_2_RDF_CONVERTER_DATA,
};
