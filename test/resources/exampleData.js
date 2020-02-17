const Path = require('path');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
//                                                    HtmlConverter                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const EX_1_HTML_CONVERTER_HTML_INFO = {
  engine: 'pug',
  file: Path.resolve('test/resources/movies.pug')
};
const EX_1_HTML_CONVERTER_DATA = {
  data: [
    {
      id: 'http://dbpedia.org/resource/A_Mighty_Heart_(film)'
    },
    {
      id: 'http://dbpedia.org/resource/Alexander_(2004_film)'
    },
    {
      id: 'http://dbpedia.org/resource/Beowulf_(2007_film)'
    }
  ]
};

const EX_2_HTML_CONVERTER_HTML_INFO = {
  engine: 'md',
  file: Path.resolve('test/resources/test.md')
};

const EX_3_HTML_CONVERTER_HTML_INFO = {
  engine: 'pug',
  file: Path.resolve('test/resources/book.pug')
};
const EX_3_HTML_CONVERTER_DATA = {
  description: 'Test description.'
};
const EX_3_HTML_CONVERTER_OUTPUT = '<h1>My book</h1><div>Test description.</div>';

const EX_4_HTML_CONVERTER_HTML_INFO = {
  engine: 'md',
  file: Path.resolve('test/resources/test-layout.md')
};
const EX_4_HTML_CONVERTER_OUTPUT = '<!DOCTYPE html><html lang="en"><head><title>Layout</title></head><body><h1>Introduction</h1>\n' +
  '<p>This is an introduction to something cool.</p>\n' +
  '</body></html>';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
//                                                    RdfConverter                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const EX_1_RDF_CONVERTER_GRAPHQLLD = {
  context: {
    "@context": {
      "label": { "@id": "http://www.w3.org/2000/01/rdf-schema#label", "@language": "en" },
      "starring": "http://dbpedia.org/ontology/starring"
    }
  }
};

const EX_1_RDF_CONVERTER_DATA = {
  data: [
    {
      "id": "http://dbpedia.org/resource/A_Mighty_Heart_(film)",
      "starring": "http://dbpedia.org/resource/Angelina_Jolie"
    },
    {
      "id": "http://dbpedia.org/resource/Alexander_(2004_film)",
      "starring": "http://dbpedia.org/resource/Angelina_Jolie"
    },
    {
      "id": "http://dbpedia.org/resource/Beowulf_(2007_film)",
      "starring": "http://dbpedia.org/resource/Angelina_Jolie"
    }
  ]
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
  EX_1_RDF_CONVERTER_GRAPHQLLD,
  EX_1_RDF_CONVERTER_DATA,
};
