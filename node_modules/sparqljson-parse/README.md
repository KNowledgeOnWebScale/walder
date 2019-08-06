# SPARQL-Results+JSON Parse

[![Build Status](https://travis-ci.org/rubensworks/sparqljson-parse.js.svg?branch=master)](https://travis-ci.org/rubensworks/sparqljson-parse.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/sparqljson-parse.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/sparqljson-parse.js?branch=master)
[![npm version](https://badge.fury.io/js/sparqljson-parse.svg)](https://www.npmjs.com/package/sparqljson-parse) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/sparqljson-parse.js.svg)](https://greenkeeper.io/)

A utility package that allows you to parse [SPARQL JSON](https://www.w3.org/TR/sparql11-results-json/) results
in a convenient [RDFJS](http://rdf.js.org/)-based datastructure.

For example, the following SPARQL JSON result can be converted as follows:

In:
```json
{
  "head": {
    "vars": [
      "book"
      ]
  },
  "results": {
    "bindings": [
      { "book": { "type": "uri", "value": "http://example.org/book/book1" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book2" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book3" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book4" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book5" } }
    ]
  }
}
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

This library automatically converts all SPARQL JSON result values to their respective RDFJS type.

## Usage

### Create a new parser

```javascript
import {SparqlJsonParser} from "sparqljson-parse";

const sparqlJsonParser = new SparqlJsonParser();
```

Optionally, you can provide a settings object to the constructor with optional parameters:
```javascript
const sparqlJsonParser = new SparqlJsonParser({
  dataFactory: dataFactory, // A custom RDFJS datafactory
  prefixVariableQuestionMark: true, // If variable names in the output should be prefixed with '?', default is false.
});
```

### Convert single bindings

```javascript
sparqlJsonParser.parseJsonBindings({ "book": { "type": "uri", "value": "http://example.org/book/book1" } })
// This will output { '?book': namedNode('http://example.org/book/book1') }
```

### Convert a full SPARQL JSON response

```javascript
const sparqlJsonresponse = {
                             "head": {
                               "vars": [
                                 "book"
                                 ]
                             },
                             "results": {
                               "bindings": [
                                 { "book": { "type": "uri", "value": "http://example.org/book/book1" } }
                               ]
                             }
                           };
sparqlJsonParser.parseJsonResults(sparqlJsonresponse);
// This will output [ { '?book': namedNode('http://example.org/book/book1') } ]
```

### Convert a full SPARQL JSON boolean response

```javascript
const sparqlJsonresponse = {
                             "head": {},
                             "boolean": true
                           };
sparqlJsonParser.parseJsonBoolean(sparqlJsonresponse);
// This will output true
```

### Convert a SPARQL JSON stream

If you have many query results, then a streaming-based approach might be more efficient.
In this case, you can use the `sparqlJsonParser.parseJsonResultsStream` method,
which takes a Node readable stream of SPARQL JSON results as a text stream,
and outputs a stream of parsed bindings.

Optionally, you can also retrieve the variables inside the `head`
as follows by listening to the `variables` event:
```
sparqlJsonParser.parseJsonResultsStream(myStream)
    .on('variables', (variables: RDF.Variable[]) => console.log(variables))
    .on('data', (bindings: IBindings) => console.log(bindings));
```

`sparqlJsonParser.parseJsonBooleanStream` also takes a stream as input,
but it returns a promise that resolves to a boolean.

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
