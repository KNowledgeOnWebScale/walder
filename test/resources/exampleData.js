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
  EX_1_RDF_CONVERTER_GRAPHQLLD,
  EX_1_RDF_CONVERTER_DATA
};