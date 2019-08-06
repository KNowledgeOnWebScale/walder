# RDF Literal

[![Build Status](https://travis-ci.org/rubensworks/rdf-literal.js.svg?branch=master)](https://travis-ci.org/rubensworks/rdf-literal.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdf-literal.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdf-literal.js?branch=master)
[![npm version](https://badge.fury.io/js/rdf-literal.svg)](https://www.npmjs.com/package/rdf-literal) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/rdf-literal.js.svg)](https://greenkeeper.io/)

RDF Literal makes it easier to translate between RDF literals and JavaScript primitives.

This library accepts [RDFJS](http://rdf.js.org/)-compliant terms.

## Installation

```bash
$ yarn install rdf-literal
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Require

```javascript
import {
  fromRdf,
  toRdf,
  getSupportedJavaScriptPrimitives,
  getSupportedRdfDatatypes,
  getTermRaw,
} from "rdf-literal";
```

_or_

```javascript
const {
  fromRdf,
  toRdf,
  getSupportedJavaScriptPrimitives,
  getSupportedRdfDatatypes,
  getTermRaw,
} = require("rdf-literal");
```

## Usage

This library offers the following functions:

* `fromRdf`: Converts an RDF literal to a JavaScript primitive.
* `toRdf`: Converts a JavaScript primitive to an RDF literal.

Next to that, the following helper functions are provided:

* `getSupportedJavaScriptPrimitives`: An array of all JavaScript primitive types that can be converted.
* `getSupportedRdfDatatypes`: An array of all RDF datatypes (as [NamedNodes](http://rdf.js.org/data-model-spec/#namednode-interface)) that can be converted.
* `getTermRaw`: Converts any RDF term to a JavaScript primitive. If the term is a literal, `fromRdf` will be called on it. Otherwise, the `.value` string will be returned.

## Examples

### Converting JavaScript _from_ RDF

`fromRdf(literal, validate?)` converts an RDF literal to a JavaScript value.

Optionally, the `validate` argument can be passed as `true`
to force an error to be thrown if an invalid value for the given datatype is detected.

#### Converting an RDF string literal

Explicit string datatypes are converted into JS strings.

```javascript
fromRdf(literal('abc'); // Returns 'abc'
fromRdf(literal('abc', 'en-us'); // Returns 'abc'
fromRdf(literal('abc',
  namedNode('http://www.w3.org/2001/XMLSchema#normalizedString')); // Returns 'abc'
```

#### Converting an RDF number literal

Integer-like and double-like literals are converted into JS numbers.

```javascript
// Integers
fromRdf(literal('123',
  namedNode('http://www.w3.org/2001/XMLSchema#integer')); // Returns 123
fromRdf(literal('123',
  namedNode('http://www.w3.org/2001/XMLSchema#long')); // Returns 123

// Doubles
fromRdf(literal('123.456',
  namedNode('http://www.w3.org/2001/XMLSchema#double')); // Returns 123.456
fromRdf(literal('123.456',
  namedNode('http://www.w3.org/2001/XMLSchema#float')); // Returns 123.456

// Invalid integers
fromRdf(literal('123.456',
  namedNode('http://www.w3.org/2001/XMLSchema#integer')); // Returns 123
fromRdf(literal('123.456',
  namedNode('http://www.w3.org/2001/XMLSchema#integer'), true); // Throws error
```

#### Converting an RDF boolean literal

Boolean literals are converted into JS booleans.

```javascript
fromRdf(literal('true',
  namedNode('http://www.w3.org/2001/XMLSchema#boolean')); // Returns true
fromRdf(literal('0',
  namedNode('http://www.w3.org/2001/XMLSchema#boolean')); // Returns false
```

#### Converting an RDF literal with unknown datatype

Unknown datatypes are considered JS strings.

```javascript
fromRdf(literal('abc',
  namedNode('http://example.org/unknown')); // Returns 'abc'
```

### Converting JavaScript _to_ RDF

`toRdf(value, dataFactory?)` converts a JavaScript value to an RDF literal term.

Optionally, a custom [DataFactory](http://rdf.js.org/data-model-spec/#datafactory-interface) can be supplied.

#### Converting a string

JS strings are converted to plain RDF literals.

```javascript
toRdf('abc'); // Returns literal('abc')
```

#### Converting a number

JS numbers are converted to RDF integers or doubles.

```javascript
toRdf(123); // Returns literal('123',
            //           namedNode('http://www.w3.org/2001/XMLSchema#integer')

toRdf(123.456); // Returns literal('123.456',
                //           namedNode('http://www.w3.org/2001/XMLSchema#double')
```

#### Converting a boolean

JS booleans are converted to RDF booleans.

```javascript
toRdf(true); // Returns literal('true',
             //           namedNode('http://www.w3.org/2001/XMLSchema#boolean')
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
