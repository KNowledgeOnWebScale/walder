# SPARQL-Results+JSON to tree

[![Build Status](https://travis-ci.org/rubensworks/sparqljson-to-tree.js.svg?branch=master)](https://travis-ci.org/rubensworks/sparqljson-to-tree.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/sparqljson-to-tree.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/sparqljson-to-tree.js?branch=master)
[![npm version](https://badge.fury.io/js/sparqljson-to-tree.svg)](https://www.npmjs.com/package/sparqljson-to-tree) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/sparqljson-to-tree.js.svg)](https://greenkeeper.io/)

A utility package that allows you to convert [SPARQL JSON](https://www.w3.org/TR/sparql11-results-json/) results to a tree-based structure.
This is done by splitting variable names by a certain delimiter value (such as `_`) and using these as paths inside a tree structure.

For example, it can convert the following SPARQL JSON results as follows:

Input:
```json
{
  "results": {
    "bindings": [
      { "books_name": { "type": "literal", "value": "Book 1" }, "books_author_name": { "type": "literal", "value": "Person 1" } },
      { "books_name": { "type": "literal", "value": "Book 2" }, "books_author_name": { "type": "literal", "value": "Person 2" } },
      { "books_name": { "type": "literal", "value": "Book 3" }, "books_author_name": { "type": "literal", "value": "Person 3" } },
      { "books_name": { "type": "literal", "value": "Book 4" }, "books_author_name": { "type": "literal", "value": "Person 4" } },
      { "books_name": { "type": "literal", "value": "Book 5" }, "books_author_name": { "type": "literal", "value": "Person 5" } }
    ]
  }
}
```

Output:
```json
{
  "books": [
    { "name": "Book 1", "author": { "name": "Person 1" } },
    { "name": "Book 2", "author": { "name": "Person 2" } },
    { "name": "Book 3", "author": { "name": "Person 3" } },
    { "name": "Book 4", "author": { "name": "Person 4" } },
    { "name": "Book 5", "author": { "name": "Person 5" } },
  ]
}
```

## Usage

### Create a new converter

```javascript
import {Converter} from "sparqljson-to-tree";

const converter = new Converter();
```

Optionally, you can provide a settings object to the constructor with optional parameters:
```javascript
const converter = new Converter({
  delimiter: '_', // The string to split variable names by. (Default: '_')
  materializeRdfJsTerms: true, // If terms should be converted to their raw value instead of being represented as RDFJS terms (Default: false)
});
```

### Convert using a schema

In order to convert a SPARQL JSON response,
we also need to provide a schema that tells which variables need to be seen as _singular_ and which ones as _plural_.

We do this using the `singularizeVariables` entry in the schema object.
For each variable (and delimited variable part), we can provide entries indicating if the part should be marked as _singular_.
If a variable part is not defined, it will be marked as _plurar_ by default,
which is consistent with the open-world-assumption of RDF.

**Note: If a variable part is marked as _singlular_, but multiple bindings apply, then only the first binding will be used.**  

```javascript
const sparqlResponse = { results: { bindings: [
  { books_name: { type: 'literal', value: 'Book 1' } },
  { books_name: { type: 'literal', value: 'Book 2' } },
  { books_name: { type: 'literal', value: 'Book 3' } },
  { books_name: { type: 'literal', value: 'Book 4' } },
  { books_name: { type: 'literal', value: 'Book 5' } },
] } };
const schema = { singularizeVariables: {
  books: false,
  books_name: true,
} };
converter.sparqlJsonResultsToTree(sparqlResponse, schema);
```

Output:
```json
{
  "books": [
    { "name": "Book 1" },
    { "name": "Book 2" },
    { "name": "Book 3" },
    { "name": "Book 4" },
    { "name": "Book 5" }
  ]
}
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
