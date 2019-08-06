# RDF Terms

[![Build Status](https://travis-ci.org/rubensworks/rdf-terms.js.svg?branch=master)](https://travis-ci.org/rubensworks/rdf-terms.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdf-terms.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdf-terms.js?branch=master)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/rubensworks/rdf-terms.js/master)](https://stryker-mutator.github.io)
[![npm version](https://badge.fury.io/js/rdf-terms.svg)](https://www.npmjs.com/package/rdf-terms) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/rdf-terms.js.svg)](https://greenkeeper.io/)

This package contains utility functions for handling
[RDFJS](https://github.com/rdfjs/representation-task-force/) terms of quads/triples.

## Usage

The following examples assume the following imports:
```javascript
import * as RdfDataModel from "rdf-data-model";
import * as RdfTerms from "rdf-terms";
```

### Constants

```javascript
// Prints [ 'subject', 'predicate', 'object', 'graph' ]
console.log(RdfTerms.QUAD_TERM_NAMES);

// Prints [ 'subject', 'predicate', 'object' ]
console.log(RdfTerms.TRIPLE_TERM_NAMES);

// Prints [ 'NamedNode', 'BlankNode', 'Literal', 'Variable', 'DefaultGraph' ]
console.log(RdfTerms.TERM_TYPES);
```

### Get quad terms

Get all terms from a quad.

_A second optional parameter can be set to true to ignore graph terms in the default graph._

```javascript
// Outputs: [ namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc'), namedNode('http://example.org/g') ]
RdfTerms.getTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
));

// Outputs: [ namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc'), defaultGraph() ]
RdfTerms.getTerms(RdfDataModel.triple(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
));

// Outputs: [ namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc') ]
RdfTerms.getTerms(RdfDataModel.triple(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
), true);
```

### Get named quad terms

Get all terms from a quad labelled with the quad term name.

This is the reverse operation from `collectNamedTerms`.

```javascript
// Outputs: [ { subject: namedNode('http://example.org/s') }, { predicate: namedNode('http://example.org/p') }, { object: literal('abc') }, { graph: namedNode('http://example.org/g') } ]
RdfTerms.getNamedTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
));
```

### Collect named quad terms

Create a quad from a an array of named quad terms.

This is the reverse operation from `getNamedTerms`.

_An second optional callback method can be provided to fill in missing terms_

```javascript
// Outputs: quad(namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc'), namedNode('http://example.org/g'))
RdfTerms.collectNamedTerms([
  { subject: RdfDataModel.namedNode('http://example.org/s') },
  { predicate: RdfDataModel.namedNode('http://example.org/p') },
  { object: RdfDataModel.literal('abc') },
  { graph: RdfDataModel.namedNode('http://example.org/g') },
]);

// Outputs: quad(namedNode('http://example.org/s'), namedNode('http://example.org/newNode'), literal('abc'), namedNode('http://example.org/g'))
RdfTerms.collectNamedTerms([
  { subject: RdfDataModel.namedNode('http://example.org/s') },
  // Missing predicate
  { object: RdfDataModel.literal('abc') },
  { graph: RdfDataModel.namedNode('http://example.org/g') },
], (termName) => RdfDataModel.namedNode('http://example.org/newNode'));
```

_An third optional argument can be passed to set a custom data factory_

```javascript
RdfTerms.collectNamedTerms([
  { subject: RdfDataModel.namedNode('http://example.org/s') },
  { predicate: RdfDataModel.namedNode('http://example.org/p') },
  { object: RdfDataModel.literal('abc') },
  { graph: RdfDataModel.namedNode('http://example.org/g') },
], null, myDataFactory);
```

### Iterate over quad terms

Invokes a callback for each term in the quad.

```javascript
// Outputs:
// subject: http://example.org/s
// predicate: http://example.org/p
// object: abc
// graph: http://example.org/g
RdfTerms.forEachTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => console.log(key + ': ' + value.value));
```

### Filter quad terms

Returns all quad terms that return true for a given filter.

```javascript
// Output: [namedNode('http://example.org/p')]
RdfTerms.filterTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => key === 'predicate');
```

### Filter quad term names

Returns all quad term names that return true for a given filter.

```javascript
// Output: ['predicate']
RdfTerms.filterQuadTermNames(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => value.equals(namedNode('http://example.org/p')));
```

### Map quad terms

Map all quad terms to form a new quad.

```javascript
// Output: quad(namedNode('http://subject'), namedNode('http://predicate'), namedNode('http://object'), namedNode('http://graph'))
RdfTerms.mapTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => namedNode('http://' + key));
```

_An second optional argument can be passed to set a custom data factory_

```javascript
// Output: quad(namedNode('http://subject'), namedNode('http://predicate'), namedNode('http://object'), namedNode('http://graph'))
RdfTerms.mapTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  (value, key) => namedNode('http://' + key),
  myDataFactory);
```

### Reduce quad terms

Reduce the quad terms to a single value.

```javascript
// Output: "START: http://example.org/s, http://example.org/p, abc, http://example.org/g"
RdfTerms.reduceTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (previous, value, key) => previous + ', ' + value.value, 'START: ');
```

### Every quad terms

Determines whether all terms satisfy the specified test.

```javascript
// Output: false
RdfTerms.everyTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'NamedNode');

// Output: true
RdfTerms.everyTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  namedNode('http://example.org/o'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'NamedNode');
```

### Some quad terms

Determines whether at least one term satisfies the specified test.

```javascript
// Output: true
RdfTerms.someTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'NamedNode');

// Output: true
RdfTerms.someTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  namedNode('http://example.org/o'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'NamedNode');

// Output: false
RdfTerms.someTerms(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  namedNode('http://example.org/o'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'Variable');
```

### Match pattern

Determines if the given quad matches with the given **quad terms**.

```javascript
// Output: true
RdfTerms.matchPattern(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
);

// Output: true
RdfTerms.matchPattern(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
);

// Output: true
RdfTerms.matchPattern(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  namedNode('http://example.org/s'),
  variable('someVariableP'),
  literal('abc'),
);

// Output: false
RdfTerms.matchPattern(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  namedNode('http://example.org/s'),
  variable('someVariableP'),
  literal('abcdef'),
);
```

### Match pattern complete

Determines if the given quad matches with the given **quad pattern** (_A quad that contains zero or more variables)_.

```javascript
// Output: true
RdfTerms.matchPatternComplete(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
));

// Output: true
RdfTerms.matchPatternComplete(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), RdfDataModel.quad(
  namedNode('http://example.org/s'),
  variable('varA'),
  literal('abc'),
  variable('varB'),
));

// Output: false
RdfTerms.matchPatternComplete(RdfDataModel.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), RdfDataModel.quad(
  namedNode('http://example.org/s'),
  variable('varA'),
  literal('abcdef'),
  variable('varB'),
));
```

### Unique terms

Create an array of unique terms from the given array.

```javascript
// Output: [namedNode('http://example.org/s')]
RdfTerms.uniqTerms([
  namedNode('http://example.org/s'),
  namedNode('http://example.org/s'),
]);
```

### Get terms of type

Find all terms of the given type in the given array.

```javascript
// Output: [namedNode('http://example.org/s'), namedNode('http://example.org/p'), namedNode('http://example.org/g')]
RdfTerms.getTermsOfType([
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
], 'NamedNode');
```

_The functions `getNamedNodes`, `getBlankNodes`, `getLiterals`, `getVariables`, `getDefaultGraphs` are convenience variants of this function,
which do not require the term type string as parameter, and perform appropriate casting in TypeScript._

```javascript
// Output: [namedNode('http://example.org/s'), namedNode('http://example.org/p'), namedNode('http://example.org/g')]
RdfTerms.getNamedNodes([
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
]);
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
