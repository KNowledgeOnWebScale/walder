# RDF String

[![Build Status](https://travis-ci.org/rubensworks/rdf-string.js.svg?branch=master)](https://travis-ci.org/rubensworks/rdf-string.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdf-string.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdf-string.js?branch=master)
[![npm version](https://badge.fury.io/js/rdf-string.svg)](https://www.npmjs.com/package/rdf-string) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/rdf-string.js.svg)](https://greenkeeper.io/)

This package contains utility functions to convert between the string-based
and [RDFJS](https://github.com/rdfjs/representation-task-force/) representations of RDF terms, quads and triples.

This allows for convenient and compact interaction with RDF terms and quads.

This string-based representation is based on the
[triple representation of N3.js](https://github.com/RubenVerborgh/N3.js#triple-representation). 

## Usage

The following examples assume the following imports:
```javascript
import * as RdfDataModel from "rdf-data-model";
import * as RdfString from "rdf-string";
```

### Term to string

Convert an RDFJS term to the string-based representation.

```javascript
// Prints http://example.org
console.log(RdfString.termToString(RdfDataModel.namedNode('http://example.org')));

// Prints _:b1
console.log(RdfString.termToString(RdfDataModel.blankNode('b1')));

// Prints "abc"
console.log(RdfString.termToString(RdfDataModel.literal('abc')));

// Prints "abc"@en-us
console.log(RdfString.termToString(RdfDataModel.literal('abc', 'en-us')));

// Prints "abc"^^http://example.org/
console.log(RdfString.termToString(RdfDataModel.literal('abc', namedNode('http://example.org/'))));

// Prints ?v1
console.log(RdfString.termToString(RdfDataModel.variable('v1')));

// Prints empty string
console.log(RdfString.termToString(RdfDataModel.defaultGraph()));
```

### String to term

Convert an string-based term to the RDFJS representation.

_Optionally, a custom RDFJS DataFactory can be provided as second argument to create terms instead of the built-in DataFactory._

```javascript
// Outputs a named node
RdfString.stringToTerm('http://example.org');

// Outputs a blank node
RdfString.stringToTerm('_:b1');

// Outputs a literal
RdfString.stringToTerm('"abc"');

// Outputs a literal with a language tag
RdfString.stringToTerm('"abc"@en-us');

// Outputs a literal with a datatype
RdfString.stringToTerm('"abc"^^http://example.org/');

// Outputs a variable
RdfString.stringToTerm('?v1');

// Outputs a default graph
RdfString.stringToTerm('');
```

### Quad to string-based quad

Convert an RDFJS quad to a string-based quad.

```javascript
// Prints { subject: 'http://example.org', predicate: 'http://example.org', object: '"abc"', graph: '' }
console.log(RdfString.quadToStringQuad(RdfDataModel.triple(
  namedNode('http://example.org'),
  namedNode('http://example.org'),
  literal('abc'),
)));
```

### String-based quad to quad

Converts a string-based quad to an RDFJS quad.

_Optionally, a custom RDFJS DataFactory can be provided as second argument to create quads and terms instead of the built-in DataFactory._

```javascript
// Outputs a quad
RdfString.stringQuadToQuad({
  subject: 'http://example.org',
  predicate: 'http://example.org',
  object: '"abc"',
  graph: '',
});
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).
These utility functions are inspired by the implementation of [N3.js](https://github.com/RubenVerborgh/N3.js).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
