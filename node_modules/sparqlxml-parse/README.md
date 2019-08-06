# SPARQL-Results+XML Parse

[![Build Status](https://travis-ci.org/rubensworks/sparqlxml-parse.js.svg?branch=master)](https://travis-ci.org/rubensworks/sparqlxml-parse.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/sparqlxml-parse.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/sparqlxml-parse.js?branch=master)
[![npm version](https://badge.fury.io/js/sparqlxml-parse.svg)](https://www.npmjs.com/package/sparqlxml-parse) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/sparqlxml-parse.js.svg)](https://greenkeeper.io/)

A utility package that allows you to parse [SPARQL XML](https://www.w3.org/TR/rdf-sparql-XMLres/) results
in a convenient [RDFJS](http://rdf.js.org/)-based datastructure.

For example, the following SPARQL XML result can be converted as follows:

In:
```json
<?xml version="1.0"?>
<sparql xmlns="http://www.w3.org/2005/sparql-results#">
  <head>
    <variable name="book"/>
  </head>
  <results>
    <result>
      <binding name="book">
	      <uri>http://example.org/book/book1</uri>
      </binding>
    </result>
    <result>
      <binding name="book">
	      <uri>http://example.org/book/book2</uri>
      </binding>
    </result>
    <result>
      <binding name="book">
	      <uri>http://example.org/book/book3</uri>
      </binding>
    </result>
    <result>
      <binding name="book">
	      <uri>http://example.org/book/book4</uri>
      </binding>
    </result>
    <result>
      <binding name="book">
	      <uri>http://example.org/book/book5</uri>
      </binding>
    </result>
  </results>
</sparql>
```

Out:
```javascript
[
  { '?book': namedNode('http://example.org/book/book1') },
  { '?book': namedNode('http://example.org/book/book2') },
  { '?book': namedNode('http://example.org/book/book3') },
  { '?book': namedNode('http://example.org/book/book4') },
  { '?book': namedNode('http://example.org/book/book5') },
]
```

Where `namedNode` is an RDFJS named node.

This library automatically converts all SPARQL XML result values to their respective RDFJS type.

## Usage

### Create a new parser

```javascript
import {SparqlXmlParser} from "sparqlxml-parse";

const sparqlXmlParser = new SparqlXmlParser();
```

Optionally, you can provide a settings object to the constructor with optional parameters:
```javascript
const sparqlXmlParser = new SparqlXmlParser({
  dataFactory: dataFactory, // A custom RDFJS datafactory
  prefixVariableQuestionMark: true, // If variable names in the output should be prefixed with '?', default is false.
});
```

### Convert a SPARQL XML response stream

If you have many query results, then a streaming-based approach
as provided by `sparqlXmlParser.parseXmlResultsStream` is ideal.

```javascript
const sparqlJsonResponseStream = streamifyString(`<?xml version="1.0"?>
<sparql xmlns="http://www.w3.org/2005/sparql-results#">
  <head>
    <variable name="book"/>
  </head>
  <results>
    <result>
      <binding name="book">
        <uri>http://example.org/book/book1</uri>
      </binding>
    </result>
  </results>
</sparql>`);
sparqlXmlParser.parseXmlResultsStream(sparqlJsonResponseStream)
    .on('data', (bindings: IBindings) => console.log(bindings));
// This will output [ { '?book': namedNode('http://example.org/book/book1') } ]
```

Optionally, you can also retrieve the variables inside the `head`
as follows by listening to the `variables` event:
```javascript
sparqlXmlParser.parseXmlResultsStream(sparqlJsonResponseStream)
    .on('variables', (variables: RDF.Variable[]) => console.log(variables))
    .on('data', (bindings: IBindings) => { return; });
// This will output [ variable('book') ]
```

### Convert a SPARQL XML boolean response stream

```javascript
const sparqlJsonResponseStream = streamifyString(`<?xml version="1.0"?>
<sparql xmlns="http://www.w3.org/2005/sparql-results#">
  <boolean>true</boolean>
</sparql>`);
sparqlXmlParser.parseXmlBooleanStream(sparqlJsonResponseStream)
    .then((result: boolean) => console.log(result));
// This will output true
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
